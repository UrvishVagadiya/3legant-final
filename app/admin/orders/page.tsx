"use client";
import { useEffect, useState } from "react";
import { Search, Eye, X, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import OrderDetailModal from "@/components/admin/OrderDetailModal";

interface Order {
  id: string; order_code: string; user_id: string; status: string;
  subtotal: number; shipping_cost: number; discount: number; tax: number; total: number;
  shipping_method: string; coupon_code: string | null;
  shipping_first_name: string; shipping_last_name: string; shipping_phone: string;
  shipping_email: string; shipping_street_address: string; shipping_city: string;
  shipping_state: string; shipping_zip_code: string; shipping_country: string;
  tracking_number: string | null; notes: string | null; created_at: string;
  payment_status: string;
  refund_status: "none" | "requested" | "approved" | "rejected";
  refund_request_reason: string | null;
  refund_requested_at: string | null;
}

interface OrderItem { id: string; product_name: string; product_image: string | null; color: string | null; quantity: number; unit_price: number; total_price: number; }

const statusOptions = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];
const statusBadge = (s: string) => ({ pending: "bg-yellow-100 text-yellow-700", confirmed: "bg-blue-100 text-blue-700", processing: "bg-cyan-100 text-cyan-700", shipped: "bg-indigo-100 text-indigo-700", delivered: "bg-green-100 text-green-700", cancelled: "bg-red-100 text-red-700", refunded: "bg-purple-100 text-purple-700" }[s] || "bg-gray-100 text-gray-700");

const paymentStatusBadge = (s: string) => ({
  completed: "bg-green-100 text-green-700",
  succeeded: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700"
}[s] || "bg-gray-100 text-gray-700");

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [editingTracking, setEditingTracking] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState("");
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesInput, setNotesInput] = useState("");

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => { const res = await fetch("/api/admin/orders"); if (res.ok) setOrders(await res.json()); setLoading(false); };

  const viewOrderDetails = async (order: Order) => {
    setSelectedOrder(order); setDetailLoading(true);
    const res = await fetch(`/api/admin/order-items?orderId=${order.id}`);
    setOrderItems(res.ok ? await res.json() : []); setDetailLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);
    const res = await fetch("/api/admin/orders", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: orderId, status: newStatus }) });
    if (!res.ok) toast.error("Failed to update status");
    else { toast.success(`Order marked as ${newStatus}`); setOrders((p) => p.map((o) => o.id === orderId ? { ...o, status: newStatus } : o)); if (selectedOrder?.id === orderId) setSelectedOrder((p) => p ? { ...p, status: newStatus } : null); }
    setUpdatingStatus(null);
  };

  const updateField = async (orderId: string, field: string, value: string) => {
    const res = await fetch("/api/admin/orders", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: orderId, [field]: value }) });
    if (!res.ok) { toast.error(`Failed to save ${field.replace("_", " ")}`); return false; }
    toast.success(`${field === "tracking_number" ? "Tracking number" : "Notes"} saved`);
    setOrders((p) => p.map((o) => o.id === orderId ? { ...o, [field]: value } : o));
    if (selectedOrder?.id === orderId) setSelectedOrder((p) => p ? { ...p, [field]: value } : null);
    return true;
  };

  const saveTracking = async (id: string) => { if (await updateField(id, "tracking_number", trackingInput)) setEditingTracking(null); };
  const saveNotes = async (id: string) => { if (await updateField(id, "notes", notesInput)) setEditingNotes(null); };

  const deleteOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order? This will also delete all order items and payments.")) return;
    const res = await fetch(`/api/admin/orders?id=${orderId}`, { method: "DELETE" });
    if (!res.ok) toast.error("Failed to delete order");
    else { toast.success("Order deleted"); setOrders((p) => p.filter((o) => o.id !== orderId)); if (selectedOrder?.id === orderId) setSelectedOrder(null); }
  };

  const filtered = orders.filter((o) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = o.order_code.toLowerCase().includes(q) || `${o.shipping_first_name} ${o.shipping_last_name}`.toLowerCase().includes(q) || o.shipping_email.toLowerCase().includes(q);
    
    if (statusFilter === "refund_requested") return matchSearch && o.refund_status === "requested";
    return matchSearch && (statusFilter === "all" || o.status === statusFilter);
  });

  if (loading) return <div className="text-[#6C7275]">Loading orders...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search orders..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#141718]" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#141718]">
          <option value="all">All Statuses</option>
          <option value="refund_requested">Refund Requested</option>
          {statusOptions.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-[#6C7275]">
              <tr>{["Order", "Customer", "Status", "Payment", "Total", "Date", "Actions"].map((h) => <th key={h} className="text-left px-6 py-3 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-[#141718]">{order.order_code}</td>
                  <td className="px-6 py-4"><p className="text-[#141718]">{order.shipping_first_name} {order.shipping_last_name}</p><p className="text-xs text-[#6C7275]">{order.shipping_email}</p></td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value)} disabled={updatingStatus === order.id || order.status === "refunded"} className={`appearance-none px-3 py-1.5 pr-7 rounded-full text-xs font-medium capitalize cursor-pointer border-0 outline-none ${order.status === "refunded" ? "opacity-80 cursor-not-allowed" : ""} ${statusBadge(order.status)}`}>
                        {statusOptions.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                      {order.status !== "refunded" && <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize w-fit ${paymentStatusBadge(order.payment_status)}`}>
                        {order.payment_status}
                      </span>
                      {order.refund_status === 'requested' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-100 text-yellow-700 animate-pulse border border-yellow-200 w-fit">
                          Refund Req
                        </span>
                      )}
                      {order.refund_status === 'approved' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 border border-green-200 w-fit">
                          Refunded
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-[#141718]">
                    ${(Number(order.total) || (Number(order.subtotal || 0) + Number(order.shipping_cost || 0) - Number(order.discount || 0))).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-[#6C7275]">{new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => viewOrderDetails(order)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-[#6C7275] hover:text-[#141718]" title="View details"><Eye size={16} /></button>
                      <button onClick={() => deleteOrder(order.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors text-[#6C7275] hover:text-red-600" title="Delete order"><X size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="px-6 py-12 text-center text-[#6C7275]">No orders found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} orderItems={orderItems} detailLoading={detailLoading} onClose={() => setSelectedOrder(null)} onUpdateStatus={updateOrderStatus}
          editingTracking={editingTracking} trackingInput={trackingInput} setTrackingInput={setTrackingInput} setEditingTracking={setEditingTracking} onSaveTracking={saveTracking}
          editingNotes={editingNotes} notesInput={notesInput} setNotesInput={setNotesInput} setEditingNotes={setEditingNotes} onSaveNotes={saveNotes} />
      )}
    </div>
  );
}
