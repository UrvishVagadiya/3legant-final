import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/utils/stripe/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    try {
        const supabase = createClient(cookies());
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const {
            items,
            shippingInfo,
            useDifferentBilling,
            billingInfo,
            shippingMethod,
            shippingCost,
            subtotal,
            discount,
            total,
            couponCode,
            couponId,
        } = body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { error: "Cart items are required" },
                { status: 400 }
            );
        }

        const lineItems = items.map(
            (item: {
                name: string;
                price: number;
                quantity: number;
                image: string;
            }) => ({
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: item.name,
                        images: item.image ? [item.image] : [],
                    },
                    unit_amount: Math.round(Number(item.price) * 100),
                },
                quantity: item.quantity,
            })
        );

        if (shippingCost > 0) {
            lineItems.push({
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: `Shipping (${shippingMethod})`,
                        images: [],
                    },
                    unit_amount: Math.round(shippingCost * 100),
                },
                quantity: 1,
            });
        }

        const discounts: { coupon: string }[] = [];
        if (discount > 0) {
            const stripeCoupon = await stripe.coupons.create({
                amount_off: Math.round(discount * 100),
                currency: "usd",
                duration: "once",
                name: couponCode || "Discount",
            });
            discounts.push({ coupon: stripeCoupon.id });
        }

        const origin = req.headers.get("origin") || "http://localhost:3000";

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            ...(discounts.length > 0 ? { discounts } : {}),
            customer_email: user.email,
            metadata: {
                user_id: user.id,
                shipping_first_name: shippingInfo.firstName,
                shipping_last_name: shippingInfo.lastName,
                shipping_phone: shippingInfo.phone,
                shipping_email: shippingInfo.email,
                shipping_street_address: shippingInfo.streetAddress,
                shipping_city: shippingInfo.city,
                shipping_state: shippingInfo.state,
                shipping_zip_code: shippingInfo.zipCode,
                shipping_country: shippingInfo.country,
                has_different_billing: useDifferentBilling ? "true" : "false",
                ...(useDifferentBilling && billingInfo
                    ? {
                        billing_first_name: billingInfo.firstName,
                        billing_last_name: billingInfo.lastName,
                        billing_phone: billingInfo.phone,
                        billing_street_address: billingInfo.streetAddress,
                        billing_city: billingInfo.city,
                        billing_state: billingInfo.state,
                        billing_zip_code: billingInfo.zipCode,
                        billing_country: billingInfo.country,
                    }
                    : {}),
                shipping_method: shippingMethod,
                subtotal: subtotal.toString(),
                shipping_cost: shippingCost.toString(),
                discount: discount.toString(),
                total: total.toString(),
                coupon_code: couponCode || "",
                coupon_id: couponId || "",
                items_json: JSON.stringify(
                    items.map(
                        (item: {
                            id: string;
                            quantity: number;
                            price: number;
                            color: string;
                        }) => ({
                            id: item.id,
                            qty: item.quantity,
                            prc: item.price,
                            clr: item.color,
                        })
                    )
                ),
            },
            success_url: `${origin}/complete?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/checkout`,
        });

        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (error: unknown) {
        console.error("Stripe checkout error:", error);
        const message =
            error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
