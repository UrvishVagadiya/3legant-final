import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { cookies } from "next/headers";

export async function GET() {
    const supabase = createClient(cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();

    const [products, orders, payments, coupons] = await Promise.all([
        admin.from("products").select("id", { count: "exact", head: true }),
        admin.from("orders").select("id, total, status, subtotal, shipping_cost, discount", { count: "exact" }),
        admin.from("payments").select("id", { count: "exact", head: true }),
        admin.from("coupons").select("id", { count: "exact", head: true }).eq("is_active", true),
    ]);

    const ordersData = (orders.data || []) as { id: string; total: number; status: string; subtotal: number; shipping_cost: number; discount: number }[];
    const totalRevenue = ordersData.reduce((sum, o) => {
        const orderTotal = Number(o.total) || (Number(o.subtotal || 0) + Number(o.shipping_cost || 0) - Number(o.discount || 0));
        return sum + orderTotal;
    }, 0);
    const pendingOrders = ordersData.filter((o) => o.status === "pending").length;

    const { data: recent } = await admin
        .from("orders")
        .select("id, order_code, status, total, created_at, shipping_first_name, shipping_last_name, subtotal, shipping_cost, discount, payments(status)")
        .order("created_at", { ascending: false })
        .limit(5);

    const recentOrders = (recent || []).map((order: any) => ({
        ...order,
        payment_status: order.payments?.[0]?.status || "unknown"
    }));

    return NextResponse.json({
        stats: {
            totalProducts: products.count || 0,
            totalOrders: orders.count || 0,
            totalRevenue,
            totalPayments: payments.count || 0,
            activeCoupons: coupons.count || 0,
            pendingOrders,
        },
        recentOrders,
    });
}
