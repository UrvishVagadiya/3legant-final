"use client";

import { X, Plus, Minus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "../../store/cartStore";
import { useIsMounted } from "@/hooks/useIsMounted";

export default function CartDrawer() {
  const { isCartOpen, toggleCart, items, removeFromCart, updateQuantity } =
    useCartStore();
  const isMounted = useIsMounted();

  if (!isMounted) return null;

  const computedSubtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-9998 transition-opacity duration-300 ${isCartOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={toggleCart}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-103.5 bg-white z-9999 transform transition-transform duration-300 ease-in-out flex flex-col font-poppins ${isCartOpen ? "translate-x-0 shadow-2xl" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-[28px] font-medium text-[#141718]">Cart</h2>
          <button
            onClick={toggleCart}
            className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-[#141718]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-2 flex flex-col gap-6 scrollbar-hide">
          {items.map((item) => (
            <div
              key={`${item.id}-${item.color}`}
              className="flex gap-4 border-b border-[#E8ECEF] pb-6 last:border-0 last:pb-0"
            >
              <div className="relative w-20 h-24 bg-[#F3F5F7] rounded overflow-hidden shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  unoptimized
                  className="object-cover mix-blend-multiply p-1"
                />
              </div>
              <div className="flex flex-col flex-1 justify-between">
                <div className="flex justify-between items-start">
                  <div className="pt-1">
                    <h3 className="text-[#141718] font-semibold text-[14px] mb-1">
                      {item.name}
                    </h3>
                    <p className="text-[#6C7275] text-[12px] mb-3">
                      Color: {item.color}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 pt-1">
                    <span className="text-[#141718] font-semibold text-[14px]">
                      ${Number(item.price).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.id, item.color)}
                      className="text-[#6C7275] hover:text-[#141718] transition-colors p-1 mt-1 -mr-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between border border-[#6C7275] rounded w-20 h-8 px-2">
                  <button
                    onClick={() =>
                      updateQuantity(item.id, item.color, item.quantity - 1)
                    }
                    className="text-[#141718]"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-[#141718] text-[12px] font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.id, item.color, item.quantity + 1)
                    }
                    className="text-[#141718]"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 pt-4 border-t border-[#E8ECEF] bg-white">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[#141718] text-[16px]">Subtotal</span>
            <span className="font-semibold text-[#141718] text-[16px]">
              ${computedSubtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center mb-6">
            <span className="text-[#141718] font-medium text-[20px]">
              Total
            </span>
            <span className="font-semibold text-[#141718] text-[20px]">
              ${computedSubtotal.toFixed(2)}
            </span>
          </div>

          {items.length === 0 ? (
            <button
              disabled
              className="w-full bg-gray-300 text-gray-500 cursor-not-allowed py-3.5 rounded-lg font-medium text-[16px] mb-4"
            >
              Checkout
            </button>
          ) : (
            <Link href="/checkout" onClick={toggleCart}>
              <button className="w-full bg-[#141718] text-white py-3.5 rounded-lg font-medium text-[16px] mb-4 hover:bg-black transition-colors">
                Checkout
              </button>
            </Link>
          )}
          <Link
            href="/cart"
            onClick={toggleCart}
            className="block text-center w-full text-[#141718] font-medium text-[14px] underline hover:text-[#6C7275] transition-colors"
          >
            View Cart
          </Link>
        </div>
      </div>
    </>
  );
}
