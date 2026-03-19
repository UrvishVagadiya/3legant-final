import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { validateCoupon } from "@/utils/coupon";
import toast from "react-hot-toast";

import { useAuth } from "@/context/AuthContext";

export function useCheckout(cartItems: any[], subtotal: number, shippingCost: number) {
    const { user } = useAuth();
    const [placing, setPlacing] = useState(false);
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<{ id: string; code: string } | null>(null);
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponLoading, setCouponLoading] = useState(false);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        const result = await validateCoupon(couponCode.trim(), subtotal);
        if (result.valid && result.coupon) {
            setAppliedCoupon({ id: result.coupon.id, code: result.coupon.code });
            setCouponDiscount(result.discount);
            setCouponCode("");
            toast.success(`Coupon applied! You saved $${result.discount.toFixed(2)}`);
        } else {
            toast.error(result.error || "Invalid coupon");
        }
        setCouponLoading(false);
    };

    const removeCoupon = () => { setAppliedCoupon(null); setCouponDiscount(0); };

    const placeOrder = async (formData: Record<string, string>, useDifferentBilling: boolean, shippingMethod: string) => {
        setPlacing(true);
        try {
            const supabase = createClient();
            if (!user) { toast.error("Please sign in to place an order"); setPlacing(false); return; }

            const finalTotal = subtotal + shippingCost - couponDiscount;

            sessionStorage.setItem("pendingOrder", JSON.stringify({
                items: cartItems.map((i) => ({ id: i.id, name: i.name, color: i.color, quantity: i.quantity, price: i.price, image: i.image })),
                subtotal, shipping: shippingCost, discount: couponDiscount, total: finalTotal,
            }));

            const res = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: cartItems.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, image: i.image, color: i.color })),
                    shippingInfo: { firstName: formData.firstName, lastName: formData.lastName, phone: formData.phone, email: formData.email, streetAddress: formData.streetAddress, city: formData.city, state: formData.state, zipCode: formData.zipCode, country: formData.country },
                    useDifferentBilling,
                    billingInfo: useDifferentBilling ? { firstName: formData.billingFirstName, lastName: formData.billingLastName, phone: formData.billingPhone, streetAddress: formData.billingStreetAddress, city: formData.billingCity, state: formData.billingState, zipCode: formData.billingZipCode, country: formData.billingCountry } : null,
                    shippingMethod, shippingCost, subtotal, discount: couponDiscount, total: finalTotal,
                    couponCode: appliedCoupon?.code || null, couponId: appliedCoupon?.id || null,
                }),
            });
            const data = await res.json();
            if (!res.ok) { toast.error(data.error || "Failed to create checkout session"); return; }
            if (data.url) window.location.href = data.url;
            else toast.error("Unable to redirect to payment page");
        } catch (err) {
            console.error("Place order error:", err);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setPlacing(false);
        }
    };

    return { placing, couponCode, setCouponCode, appliedCoupon, couponDiscount, couponLoading, handleApplyCoupon, removeCoupon, placeOrder };
}

export function validateCheckoutForm(formData: Record<string, string>, useDifferentBilling: boolean): Record<string, string> {
    const errors: Record<string, string> = {};
    const req = (key: string, msg: string) => { if (!formData[key]?.trim()) errors[key] = msg; };
    req("firstName", "First name is required"); req("lastName", "Last name is required");
    req("phone", "Phone number is required"); req("streetAddress", "Street address is required");
    req("country", "Country is required"); req("city", "City is required");
    req("state", "State is required"); req("zipCode", "Zip code is required");
    if (!formData.email?.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email format is invalid";
    if (useDifferentBilling) {
        req("billingFirstName", "First name is required"); req("billingLastName", "Last name is required");
        req("billingPhone", "Phone number is required"); req("billingStreetAddress", "Street address is required");
        req("billingCountry", "Country is required"); req("billingCity", "City is required");
        req("billingState", "State is required"); req("billingZipCode", "Zip code is required");
    }
    return errors;
}
