import Image from "next/image";
import { Ticket } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number | string;
  image: string;
  color: string;
  quantity: number;
}

interface OrderSummaryProps {
  cartItems: CartItem[];
  updateQuantity: (id: string, color: string, qty: number) => void;
  subtotal: number;
  shippingCost: number;
  shippingMethod: string;
  discount: number;
  total: number;
  couponCode: string;
  setCouponCode: (v: string) => void;
  onApplyCoupon: () => void;
  couponLoading: boolean;
  appliedCoupon: { id: string; code: string } | null;
  onRemoveCoupon: () => void;
  placing: boolean;
  onPlaceOrder: () => void;
}

export default function OrderSummary({
  cartItems,
  updateQuantity,
  subtotal,
  shippingMethod,
  discount,
  total,
  couponCode,
  setCouponCode,
  onApplyCoupon,
  couponLoading,
  appliedCoupon,
  onRemoveCoupon,
  placing,
  onPlaceOrder,
}: OrderSummaryProps) {
  return (
    <div className="border border-gray-300 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Order summary</h2>

      <div className="space-y-4 mb-6 max-h-100 overflow-y-auto pr-2">
        {cartItems.map((item) => (
          <div key={item.id} className="flex gap-4 items-center">
            <div className="relative w-16 h-20 bg-[#F3F5F7] rounded shrink-0 flex items-center justify-center">
              <Image
                src={item.image}
                alt={item.name}
                fill
                unoptimized
                className="object-contain p-2"
              />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-sm">{item.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Color: {item.color}
                  </p>
                </div>
                <span className="font-semibold text-sm">
                  ${(Number(item.price) * item.quantity).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center border border-gray-300 rounded px-2 py-0.5 mt-2 w-fit gap-3">
                <button
                  onClick={() =>
                    updateQuantity(item.id, item.color, item.quantity - 1)
                  }
                  className="text-gray-500 text-sm"
                >
                  -
                </button>
                <span className="font-semibold text-sm">{item.quantity}</span>
                <button
                  onClick={() =>
                    updateQuantity(item.id, item.color, item.quantity + 1)
                  }
                  className="text-gray-500 text-sm"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center border border-gray-300 rounded overflow-hidden mb-6">
        <input
          type="text"
          placeholder="Coupon code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          className="w-full py-3 px-4 outline-none text-sm placeholder-gray-400"
        />
        <button
          onClick={onApplyCoupon}
          className="px-6 py-3 font-semibold text-sm bg-[#141718] text-white hover:bg-black transition-colors"
        >
          {couponLoading ? "..." : "Apply"}
        </button>
      </div>

      <div className="space-y-3 border-b border-gray-200 pb-4 mb-4">
        {appliedCoupon && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Ticket size={16} />
              <span>{appliedCoupon.code}</span>
            </div>
            <div className="text-[#38CB89] font-medium text-sm">
              -${discount.toFixed(2)}{" "}
              <span
                onClick={onRemoveCoupon}
                className="text-gray-400 ml-1 cursor-pointer hover:text-black"
              >
                [Remove]
              </span>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium">
            {shippingMethod === "free" && "Free"}
            {shippingMethod === "express" && "$15.00"}
            {shippingMethod === "pickup" && "$21.00"}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <span className="text-lg font-semibold">Total</span>
        <span className="text-xl font-semibold">${total.toFixed(2)}</span>
      </div>

      <div className="hidden lg:block">
        <button
          onClick={onPlaceOrder}
          disabled={placing}
          className="w-full bg-[#141718] text-white py-4 rounded font-semibold hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {placing ? "Redirecting to Payment..." : "Pay with Stripe"}
        </button>
      </div>
    </div>
  );
}
