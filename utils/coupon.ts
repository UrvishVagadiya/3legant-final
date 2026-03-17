import { createClient } from "@/utils/supabase/client";

export interface Coupon {
    id: string;
    code: string;
    discount_type: string;
    discount_value: number;
    min_order_amount: number;
    max_discount_amount: number | null;
    usage_limit: number | null;
    used_count: number;
    is_active: boolean;
    valid_from: string;
    valid_until: string | null;
}

export async function validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; coupon?: Coupon; discount: number; error?: string }> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase().trim())
        .eq('is_active', true)
        .single();

    if (error || !data) {
        return { valid: false, discount: 0, error: 'Invalid coupon code' };
    }

    const coupon = data as Coupon;

    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
        return { valid: false, discount: 0, error: 'Coupon has expired' };
    }

    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        return { valid: false, discount: 0, error: 'Coupon usage limit reached' };
    }

    if (subtotal < coupon.min_order_amount) {
        return { valid: false, discount: 0, error: `Minimum order amount is $${coupon.min_order_amount.toFixed(2)}` };
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
        discount = subtotal * (coupon.discount_value / 100);
        if (coupon.max_discount_amount) {
            discount = Math.min(discount, coupon.max_discount_amount);
        }
    } else {
        discount = coupon.discount_value;
    }

    discount = Math.min(discount, subtotal);

    return { valid: true, coupon, discount };
}

export async function incrementCouponUsage(couponId: string): Promise<void> {
    const res = await fetch('/api/coupons/increment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponId }),
    });
    if (!res.ok) {
        console.error('Failed to increment coupon usage:', await res.text());
    }
}
