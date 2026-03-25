import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    try {
        const supabase = createClient(cookies());
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { orderId } = await req.json();
        if (!orderId) return NextResponse.json({ error: "Order ID is required" }, { status: 400 });

        // Update order status to 'cancelled' if it's currently 'pending'
        // Update order status to cancelled
        const { error } = await supabase
            .from("orders")
            .update({ status: "cancelled" })
            .eq("id", orderId)
            .eq("user_id", user.id);

        if (error) throw error;

        // Also update the payment status to 'failed' (as per user request "i want failed")
        await supabase
            .from("payments")
            .update({ status: "failed" })
            .eq("order_id", orderId);

        return NextResponse.json({ success: true, message: "Order cancelled" });
    } catch (error: any) {
        console.error("Cancel pending order error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
