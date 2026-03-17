"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import CheckoutStepper from "@/components/sections/CheckoutStepper";
import { useCartStore } from "@/store/cartStore";

interface OrderItem {
  id: string;
  name: string;
  color: string;
  quantity: number;
  price: number;
  image: string;
}

interface OrderData {
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  orderCode: string;
  date: string;
  cardLast4?: string;
  cardBrand?: string;
}

const Complete = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const { clearCart } = useCartStore();

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (sessionId) {
      // Stripe payment completed - fetch order data from API
      const fetchOrderData = async () => {
        try {
          const res = await fetch(
            `/api/stripe/session?session_id=${encodeURIComponent(sessionId)}`,
          );
          if (res.ok) {
            const data = await res.json();
            setOrderData(data);
            clearCart();
            // Clean up any pending order data
            sessionStorage.removeItem("pendingOrder");
          } else {
            console.error("Failed to fetch order data");
            router.push("/");
          }
        } catch (err) {
          console.error("Error fetching order data:", err);
          router.push("/");
        } finally {
          setLoading(false);
        }
      };
      fetchOrderData();
    } else {
      const stored = sessionStorage.getItem("lastOrder");
      if (stored) {
        setOrderData(JSON.parse(stored));
        setLoading(false);
      } else {
        router.push("/");
      }
    }
  }, [searchParams, router, clearCart]);

  if (loading || !orderData) {
    return (
      <div className="max-w-300 mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 mb-20 font-poppins text-[#141718] flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-[#141718] rounded-full animate-spin mb-4" />
          <p className="text-[#6C7275] text-lg">Processing your order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-300 mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 mb-20 font-poppins text-[#141718]">
      <div className="flex flex-col items-center justify-center mb-8 md:mb-20">
        <h1 className="text-4xl md:text-[54px] font-medium mb-8">Complete!</h1>
        <CheckoutStepper step={3} />
      </div>

      <div className="max-w-184.5 w-full mx-auto bg-white rounded-2xl md:shadow-[0px_8px_40px_rgba(0,0,0,0.08)] py-12 md:py-20 px-6 md:px-20 flex flex-col items-center">
        <p className="text-[#6C7275] text-xl md:text-[28px] font-medium mb-4">
          Thank you! 🎉
        </p>
        <h2 className="text-[32px] md:text-[40px] font-medium mb-12 text-center leading-[1.2]">
          Your order has been
          <br />
          received
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-12">
          {orderData.items.map((item) => (
            <div
              key={item.id}
              className="relative w-20 h-24 bg-[#F3F5F7] rounded shrink-0 flex items-center justify-center"
            >
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  unoptimized
                  className="object-cover p-2"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                  No img
                </div>
              )}
              <div className="absolute -top-3 -right-3 bg-[#141718] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 border-white shadow-sm">
                {item.quantity}
              </div>
            </div>
          ))}
        </div>

        <div className="w-full max-w-95">
          <div className="grid grid-cols-[140px_1fr] md:grid-cols-[160px_1fr] gap-y-6 mb-12 text-[15px]">
            <span className="font-semibold text-[#6C7275]">Order code:</span>
            <span className="font-semibold text-[#141718]">
              {orderData.orderCode}
            </span>

            <span className="font-semibold text-[#6C7275]">Date:</span>
            <span className="font-semibold text-[#141718]">
              {orderData.date}
            </span>

            <span className="font-semibold text-[#6C7275]">Total:</span>
            <span className="font-semibold text-[#141718]">
              ${Number(orderData.total).toFixed(2)}
            </span>

            <span className="font-semibold text-[#6C7275]">
              Payment method:
            </span>
            <span className="font-semibold text-[#141718]">
              {orderData.paymentMethod}
              {orderData.cardLast4 && (
                <span className="text-[#6C7275] text-sm ml-1">
                  ({orderData.cardBrand && `${orderData.cardBrand} `}••••{" "}
                  {orderData.cardLast4})
                </span>
              )}
            </span>
          </div>
        </div>

        <Link href="/account">
          <button className="bg-[#141718] text-white px-10 py-3 md:py-4 rounded-full font-medium text-base hover:bg-black transition-colors min-w-50 flex items-center justify-center mt-4">
            Purchase history
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Complete;
