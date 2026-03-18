"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import OrderExpandedDetails from "./OrderExpandedDetails";

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  color: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  order_code: string;
  created_at: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  shipping_method: string;
  tracking_number: string | null;
  payment_status: string;
  refund_status: "none" | "requested" | "approved" | "rejected";
  refund_request_reason: string | null;
  refund_requested_at: string | null;
}

const badgeStyles: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  // Order Statuses
  delivered: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-100" },
  shipped: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", border: "border-blue-100" },
  confirmed: { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500", border: "border-indigo-100" },
  processing: { bg: "bg-sky-50", text: "text-sky-700", dot: "bg-sky-500", border: "border-sky-100" },
  pending: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", border: "border-amber-100" },
  cancelled: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500", border: "border-rose-100" },
  refunded: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500", border: "border-purple-100" },
  // Payment Statuses
  completed: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-100" },
  succeeded: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-100" },
  failed: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500", border: "border-rose-100" },
  unknown: { bg: "bg-slate-50", text: "text-slate-600", dot: "bg-slate-400", border: "border-slate-100" },
};

const StatusBadge = ({ type, status }: { type: "order" | "payment"; status: string }) => {
  const style = badgeStyles[status.toLowerCase()] || badgeStyles.unknown;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[9px] text-[#6C7275] uppercase font-bold tracking-widest leading-none opacity-50 mb-0.5 ml-1">
        {type}
      </span>
      <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border ${style.bg} ${style.text} ${style.border} shadow-sm transition-all hover:shadow-md`}>
        <div className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse`} />
        <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
          {status}
        </span>
      </div>
    </div>
  );
};

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const OrdersHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [loadingItems, setLoadingItems] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        setLoading(false); 
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, order_code, created_at, status, subtotal, shipping_cost, discount, total, shipping_method, tracking_number, payments(status), refund_status, refund_request_reason, refund_requested_at",
        )
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Fetch orders error:", error);
        setOrders([]);
      } else if (data) {
        const mappedData = data.map((o: any) => ({
          ...o,
          payment_status: o.payments?.[0]?.status || "unknown"
        }));
        setOrders(mappedData);
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const toggleOrderDetails = async (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }
    setExpandedOrder(orderId);

    if (!orderItems[orderId]) {
      setLoadingItems(orderId);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("order_items")
        .select(
          "id, product_name, product_image, color, quantity, unit_price, total_price",
        )
        .eq("order_id", orderId);

      if (!error && data)
        setOrderItems((prev) => ({ ...prev, [orderId]: data }));
      setLoadingItems(null);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="font-semibold text-[20px] mb-6 md:mb-8">
          Orders History
        </h1>
        <p className="text-[#6C7275]">Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div>
        <h1 className="font-semibold text-[20px] mb-6 md:mb-8">
          Orders History
        </h1>
        <p className="text-[#6C7275]">No orders yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-semibold text-[20px] mb-6 md:mb-8">Orders History</h1>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <p className="text-[#6C7275]">No orders yet.</p>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="border border-gray-200 rounded-xl overflow-hidden transition-all hover:border-gray-300 bg-white"
            >
              <button
                onClick={() => toggleOrderDetails(order.id)}
                className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-gray-50/50 transition-colors text-left"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-12 flex-1">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-[#6C7275] uppercase font-bold tracking-widest leading-none opacity-60">
                      Order ID
                    </span>
                    <span className="font-bold text-sm text-[#141718]">
                      {order.order_code}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-[#6C7275] uppercase font-bold tracking-widest leading-none opacity-60">
                      Date
                    </span>
                    <span className="text-sm text-[#141718] font-medium">
                      {formatDate(order.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-2 sm:mt-0">
                    <StatusBadge type="order" status={order.status} />
                    <StatusBadge type="payment" status={order.payment_status} />
                  </div>
                </div>
              <div className="flex items-center gap-4">
                  <span className="font-semibold text-[#141718]">
                    ${(Number(order.total) || (Number(order.subtotal) + Number(order.shipping_cost) - Number(order.discount))).toFixed(2)}
                  </span>
                {expandedOrder === order.id ? (
                  <ChevronUp size={18} className="text-[#6C7275]" />
                ) : (
                  <ChevronDown size={18} className="text-[#6C7275]" />
                )}
              </div>
            </button>

            {expandedOrder === order.id && (
              <OrderExpandedDetails
                order={{
                  ...order,
                  payment_status: order.payment_status
                }}
                items={orderItems[order.id] || []}
                loadingItems={loadingItems === order.id}
              />
            )}
          </div>
        )))}
      </div>
    </div>
  );
};

export default OrdersHistory;
