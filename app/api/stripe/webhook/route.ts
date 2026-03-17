import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/utils/stripe/server";
import { createAdminClient } from "@/utils/supabase/admin";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
        return NextResponse.json(
            { error: "Missing stripe-signature header" },
            { status: 400 }
        );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        console.error("Missing STRIPE_WEBHOOK_SECRET");
        return NextResponse.json(
            { error: "Webhook secret not configured" },
            { status: 500 }
        );
    }

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("Webhook signature verification failed:", message);
        return NextResponse.json(
            { error: `Webhook Error: ${message}` },
            { status: 400 }
        );
    }

    const admin = createAdminClient();

    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;

            if (session.payment_status !== "paid") break;

            const meta = session.metadata || {};
            const userId = meta.user_id;
            if (!userId) {
                console.error("No user_id in session metadata");
                break;
            }

            // Check if order already exists for this session (idempotency)
            const { data: existingPayment } = await admin
                .from("payments")
                .select("id")
                .eq("transaction_id", session.payment_intent as string)
                .single();

            if (existingPayment) {
                console.log("Order already processed for this payment intent");
                break;
            }

            const orderCode = `#${Date.now().toString().slice(-10)}`;
            const items = JSON.parse(meta.items_json || "[]");
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
                    shipping_first_name: meta.shipping_first_name,
                    shipping_last_name: meta.shipping_last_name,
                    shipping_phone: meta.shipping_phone,
                    shipping_email: meta.shipping_email,
                    shipping_street_address: meta.shipping_street_address,
                    shipping_city: meta.shipping_city,
                    shipping_state: meta.shipping_state,
                    shipping_zip_code: meta.shipping_zip_code,
                    shipping_country: meta.shipping_country,
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
                break;
            }

            // Create order items
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

            // Get payment details from Stripe
            let cardLast4: string | null = null;
            let cardBrand: string | null = null;

            if (session.payment_intent) {
                try {
                    const paymentIntent = await stripe.paymentIntents.retrieve(
                        session.payment_intent as string,
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
                transaction_id: session.payment_intent as string,
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

            // Delete user's cart after successful payment
            await admin.from("cart").delete().eq("user_id", userId);

            console.log(`Order ${orderCode} created successfully for session ${session.id}`);
            break;
        }

        case "charge.refunded": {
            const charge = event.data.object as Stripe.Charge;
            const paymentIntentId =
                typeof charge.payment_intent === "string"
                    ? charge.payment_intent
                    : charge.payment_intent?.id;

            if (!paymentIntentId) break;

            // Find payment by transaction_id
            const { data: payment } = await admin
                .from("payments")
                .select("id, order_id, amount")
                .eq("transaction_id", paymentIntentId)
                .single();

            if (!payment) {
                console.error("Payment not found for refund:", paymentIntentId);
                break;
            }

            const refundedAmount = charge.amount_refunded / 100;
            const isFullRefund = refundedAmount >= Number(payment.amount);

            // Update payment record
            await admin
                .from("payments")
                .update({
                    status: isFullRefund ? "refunded" : "completed",
                    refund_amount: refundedAmount,
                    refund_date: new Date().toISOString(),
                    refund_reason:
                        charge.refunds?.data?.[0]?.reason || "Refund processed via Stripe",
                    updated_at: new Date().toISOString(),
                })
                .eq("id", payment.id);

            // Update order status if fully refunded
            if (isFullRefund) {
                await admin
                    .from("orders")
                    .update({
                        status: "refunded",
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", payment.order_id);
            }

            console.log(
                `Refund of $${refundedAmount} processed for payment ${payment.id}`
            );
            break;
        }

        case "payment_intent.payment_failed": {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            console.error(
                "Payment failed:",
                paymentIntent.id,
                paymentIntent.last_payment_error?.message
            );
            break;
        }

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
