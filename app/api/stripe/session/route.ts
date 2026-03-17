import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/utils/stripe/server";
import { createAdminClient } from "@/utils/supabase/admin";
import Stripe from "stripe";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
        return NextResponse.json(
            { error: "Missing session_id" },
            { status: 400 }
        );
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== "paid") {
            return NextResponse.json(
                { error: "Payment not completed" },
                { status: 400 }
            );
        }

        const meta = session.metadata || {};
        const items = JSON.parse(meta.items_json || "[]");
        const userId = meta.user_id;
        const paymentIntentId = session.payment_intent as string;

        const admin = createAdminClient();

        // Check if order already exists (created by webhook)
        let payment = null;
        if (paymentIntentId) {
            const { data } = await admin
                .from("payments")
                .select("*, orders(id, order_code, created_at)")
                .eq("transaction_id", paymentIntentId)
                .single();
            payment = data;
        }

        // If order doesn't exist yet, create it now (webhook may not have fired)
        if (!payment && userId) {
            const orderCode = `#${Date.now().toString().slice(-10)}`;
            let subtotal = parseFloat(meta.subtotal || "0");
            let shippingCost = parseFloat(meta.shipping_cost || "0");
            let discountAmount = parseFloat(meta.discount || "0");
            let total = parseFloat(meta.total || "0");

            // Backend Robustness: If total is 0, recalculate from items
            if (total === 0 && items.length > 0) {
                subtotal = items.reduce((acc: number, item: any) => acc + (Number(item.price) * item.quantity), 0);
                total = subtotal + shippingCost - discountAmount;
            }

            // Create order
            const hasDifferentBilling = meta.has_different_billing === "true";
            const { data: order, error: orderError } = await admin
                .from("orders")
                .insert({
                    order_code: orderCode,
                    user_id: userId,
                    status: "confirmed",
                    subtotal,
                    shipping_cost: shippingCost,
                    discount: discountAmount,
                    tax: 0,
                    total,
                    shipping_method: meta.shipping_method || "free",
                    coupon_code: meta.coupon_code || null,
                    shipping_first_name: meta.shipping_first_name || "",
                    shipping_last_name: meta.shipping_last_name || "",
                    shipping_phone: meta.shipping_phone || "",
                    shipping_email: meta.shipping_email || "",
                    shipping_street_address: meta.shipping_street_address || "",
                    shipping_city: meta.shipping_city || "",
                    shipping_state: meta.shipping_state || "",
                    shipping_zip_code: meta.shipping_zip_code || "",
                    shipping_country: meta.shipping_country || "",
                    has_different_billing: hasDifferentBilling,
                    ...(hasDifferentBilling
                        ? {
                            billing_first_name: meta.billing_first_name || null,
                            billing_last_name: meta.billing_last_name || null,
                            billing_phone: meta.billing_phone || null,
                            billing_street_address: meta.billing_street_address || null,
                            billing_city: meta.billing_city || null,
                            billing_state: meta.billing_state || null,
                            billing_zip_code: meta.billing_zip_code || null,
                            billing_country: meta.billing_country || null,
                        }
                        : {}),
                })
                .select()
                .single();

            if (orderError) {
                console.error("Failed to create order:", orderError);
                return NextResponse.json({
                    items,
                    subtotal: parseFloat(meta.subtotal || "0"),
                    discount: parseFloat(meta.discount || "0"),
                    total: parseFloat(meta.total || "0"),
                    paymentMethod: "Credit Card (Stripe)",
                    orderCode: `#${Date.now().toString().slice(-10)}`,
                    date: new Date().toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    }),
                    cardLast4: null,
                    cardBrand: null,
                });
            }

            // Create order items
            if (items.length > 0) {
                const orderItems = items.map(
                    (item: {
                        id: string;
                        name: string;
                        image: string;
                        color: string;
                        quantity: number;
                        price: number;
                    }) => ({
                        order_id: order.id,
                        product_id: item.id,
                        product_name: item.name,
                        product_image: item.image,
                        color: item.color,
                        quantity: item.quantity,
                        unit_price: Number(item.price),
                        total_price: Number(item.price) * item.quantity,
                    })
                );

                const { error: itemsError } = await admin
                    .from("order_items")
                    .insert(orderItems);

                if (itemsError) {
                    console.error("Failed to create order items:", itemsError);
                }
            }

            // Get card details from Stripe
            let cardLast4: string | null = null;
            let cardBrand: string | null = null;

            if (paymentIntentId) {
                try {
                    const paymentIntent = await stripe.paymentIntents.retrieve(
                        paymentIntentId,
                        { expand: ["payment_method"] }
                    );
                    const pm = paymentIntent.payment_method as Stripe.PaymentMethod;
                    if (pm?.card) {
                        cardLast4 = pm.card.last4;
                        cardBrand = pm.card.brand;
                    }
                } catch (err) {
                    console.error("Failed to retrieve payment method details:", err);
                }
            }

            // Create payment record
            const { error: paymentError } = await admin.from("payments").insert({
                order_id: order.id,
                user_id: userId,
                payment_method: "card",
                status: "completed",
                amount: total,
                currency: "USD",
                transaction_id: paymentIntentId,
                card_last_four: cardLast4,
                card_brand: cardBrand,
                payment_date: new Date().toISOString(),
                refund_amount: 0,
                refund_date: null,
                refund_reason: null,
            });

            if (paymentError) {
                console.error("Failed to create payment:", paymentError);
            }

            // Increment coupon usage if applicable
            if (meta.coupon_id) {
                const { data: coupon } = await admin
                    .from("coupons")
                    .select("used_count")
                    .eq("id", meta.coupon_id)
                    .single();

                if (coupon) {
                    await admin
                        .from("coupons")
                        .update({ used_count: (coupon.used_count || 0) + 1 })
                        .eq("id", meta.coupon_id);
                }
            }

            // Clear user's cart
            await admin.from("cart").delete().eq("user_id", userId);

            return NextResponse.json({
                items,
                subtotal,
                discount: discountAmount,
                total,
                paymentMethod: "Credit Card (Stripe)",
                orderCode,
                date: new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                }),
                cardLast4,
                cardBrand,
            });
        }

        // Order already exists (created by webhook), return data from DB
        const orderData = payment?.orders;
        const orderCode = orderData
            ? (Array.isArray(orderData)
                ? orderData[0]?.order_code
                : (orderData as { order_code: string }).order_code)
            : `#${Date.now().toString().slice(-10)}`;

        const orderDate = orderData
            ? new Date(
                Array.isArray(orderData)
                    ? orderData[0]?.created_at
                    : (orderData as { created_at: string }).created_at
            ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            })
            : new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });

        const finalSubtotal = parseFloat(meta.subtotal || "0") || items.reduce((acc: number, item: any) => acc + (Number(item.price) * item.quantity), 0);
        const finalDiscount = parseFloat(meta.discount || "0");
        const finalShipping = parseFloat(meta.shipping_cost || "0");
        const finalTotal = parseFloat(meta.total || "0") || (finalSubtotal + finalShipping - finalDiscount);

        return NextResponse.json({
            items,
            subtotal: finalSubtotal,
            discount: finalDiscount,
            total: finalTotal,
            paymentMethod: "Credit Card (Stripe)",
            orderCode,
            date: orderDate,
            cardLast4: payment?.card_last_four || null,
            cardBrand: payment?.card_brand || null,
        });
    } catch (error) {
        console.error("Session retrieval error:", error);
        return NextResponse.json(
            { error: "Failed to retrieve session" },
            { status: 500 }
        );
    }
}
