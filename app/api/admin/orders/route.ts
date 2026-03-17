import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { cookies } from "next/headers";

async function getAuthUser() {
    const supabase = createClient(cookies());
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export async function GET() {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();
    const { data, error } = await admin
        .from("orders")
        .select("*, payments(status)")
        .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const ordersWithPaymentStatus = (data || []).map((order: any) => ({
        ...order,
        payment_status: order.payments?.[0]?.status || "unknown",
        refund_status: order.refund_status || 'none'
    }));

    return NextResponse.json(ordersWithPaymentStatus);
}

export async function PUT(req: NextRequest) {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, ...payload } = body;
    const admin = createAdminClient();
    const { data, error } = await admin
        .from("orders")
        .update(payload)
        .eq("id", id)
        .select("*, payments(status)")
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const orderWithPaymentStatus = {
        ...data,
        payment_status: data.payments?.[0]?.status || "unknown",
        refund_status: data.refund_status || 'none'
    };

    return NextResponse.json(orderWithPaymentStatus);
}

export async function DELETE(req: NextRequest) {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const admin = createAdminClient();
    const { error } = await admin.from("orders").delete().eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
