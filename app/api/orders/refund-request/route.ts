import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    try {
        const supabase = createClient(cookies());
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { orderId, reason } = await req.json();

        if (!orderId || !reason) {
            return NextResponse.json({ error: "Order ID and reason are required" }, { status: 400 });
        }

        // Verify order belongs to user and is eligible for refund (e.g. delivered)
        const { data: order, error: fetchError } = await supabase
            .from("orders")
            .select("id, status, refund_status")
            .eq("id", orderId)
            .eq("user_id", user.id)
            .single();

        if (fetchError || !order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        if (order.refund_status !== "none") {
            return NextResponse.json({ error: "Refund already requested for this order" }, { status: 400 });
        }

        // Only allow refund requests for confirmed/processing/shipped/delivered orders
        const eligibleStatuses = ["confirmed", "processing", "shipped", "delivered"];
        if (!eligibleStatuses.includes(order.status)) {
            return NextResponse.json({ error: `Refund request not allowed for current order status: ${order.status}` }, { status: 400 });
        }

        const { error: updateError } = await supabase
            .from("orders")
            .update({
                refund_status: "requested",
                refund_request_reason: reason,
                refund_requested_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq("id", orderId);

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Refund request error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
