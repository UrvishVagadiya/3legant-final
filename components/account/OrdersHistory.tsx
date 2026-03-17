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

const statusColors: Record<string, string> = {
  delivered: "text-green-600 bg-green-50",
  shipped: "text-blue-600 bg-blue-50",
  confirmed: "text-blue-600 bg-blue-50",
  processing: "text-cyan-600 bg-cyan-50",
  pending: "text-yellow-600 bg-yellow-50",
  cancelled: "text-red-600 bg-red-50",
  refunded: "text-purple-600 bg-purple-50",
};

const paymentStatusColors: Record<string, string> = {
  completed: "text-green-600 bg-green-50",
  succeeded: "text-green-600 bg-green-50",
  pending: "text-yellow-600 bg-yellow-50",
  failed: "text-red-600 bg-red-50",
  unknown: "text-gray-600 bg-gray-50",
};

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
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
        {orders.map((order) => (
          <div
            key={order.id}
            className="border border-gray-200 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => toggleOrderDetails(order.id)}
              className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 flex-1">
                <span className="font-semibold text-sm text-[#141718]">
                  {order.order_code}
                </span>
                <span className="text-sm text-[#6C7275]">
                  {formatDate(order.created_at)}
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#6C7275] uppercase font-bold tracking-wider leading-none mb-1">Order</span>
                    <span
                      className={`text-xs font-medium capitalize px-3 py-1 rounded-full w-fit ${statusColors[order.status] || "text-[#141718] bg-gray-50"}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#6C7275] uppercase font-bold tracking-wider leading-none mb-1">Payment</span>
                    <span
                      className={`text-xs font-medium capitalize px-3 py-1 rounded-full w-fit ${paymentStatusColors[order.payment_status] || "text-[#141718] bg-gray-50"}`}
                    >
                      {order.payment_status}
                    </span>
                  </div>
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
        ))}
      </div>
    </div>
  );
};

export default OrdersHistory;
