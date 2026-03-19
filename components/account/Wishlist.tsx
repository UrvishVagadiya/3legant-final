"use client";
import React from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { useWishlistStore } from "../../store/wishlistStore";
import { useCartStore } from "../../store/cartStore";

import { useAuth } from "@/context/AuthContext";

const Wishlist = () => {
  const { user } = useAuth();
  const { items: wishlistItems, removeFromWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();

  const formatPrice = (price: string | number) => {
    const numPrice =
      typeof price === "string"
        ? parseFloat(price.replace(/[^0-9.]/g, ""))
        : price;
    return isNaN(numPrice) ? "0.00" : numPrice.toFixed(2);
  };

  if (wishlistItems.length === 0) {
    return (
      <div>
        <h1 className="font-semibold text-[20px] mb-6 md:mb-8">
          Your Wishlist
        </h1>
        <p className="text-[#6C7275]">Your wishlist is currently empty.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-semibold text-[20px] mb-6 md:mb-8">Your Wishlist</h1>

      <div className="hidden md:block w-full">
        <table className="w-full text-left text-[14px]">
          <thead className="border-b border-gray-200 text-[#6C7275]">
            <tr>
              <th className="py-4 font-normal w-1/2">Product</th>
              <th className="py-4 font-normal w-1/4">Price</th>
              <th className="py-4 font-normal w-1/4">Action</th>
            </tr>
          </thead>
          <tbody>
            {wishlistItems.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-100 last:border-0"
              >
                <td className="py-6 flex items-center gap-4">
                  <button
                    onClick={() => removeFromWishlist(item.id, user)}
                    className="text-gray-400 hover:text-black transition-colors"
                  >
                    <X size={20} />
                  </button>
                  <div className="relative w-16 h-16 bg-gray-100 shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-[#141718] mb-1 leading-none text-[15px]">
                      {item.name}
                    </span>
                    <span className="text-[#6C7275] text-[13px]">
                      Color: {item.color || "Default"}
                    </span>
                  </div>
                </td>
                <td className="py-6 text-[#141718]">
                  ${formatPrice(item.price)}
                </td>
                <td className="py-6">
                  <button
                    onClick={() =>
                      addToCart({
                        id: String(item.id),
                        name: item.name,
                        price:
                          typeof item.price === "string"
                            ? parseFloat(item.price.replace(/[^0-9.]/g, ""))
                            : item.price,
                        image: item.image,
                        color: item.color || "Default",
                      }, user)
                    }
                    className="bg-[#141718] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors w-full sm:w-auto"
                  >
                    Add to cart
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden flex flex-col w-full">
        <div className="border-b border-gray-200 pb-2 mb-2 text-[#6C7275] text-sm">
          Product
        </div>
        {wishlistItems.map((item) => (
          <div
            key={item.id}
            className="py-6 border-b border-gray-100 last:border-0 flex flex-col gap-4"
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => removeFromWishlist(item.id)}
                className="text-gray-400 hover:text-black transition-colors"
              >
                <X size={20} />
              </button>
              <div className="relative w-20 h-20 bg-gray-100 shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-1 w-full relative">
                <span className="font-semibold text-[#141718] text-[15px]">
                  {item.name}
                </span>
                <span className="text-[#6C7275] text-[13px]">
                  Color: {item.color || "Default"}
                </span>
                <span className="text-[#141718] font-medium mt-1 text-[15px]">
                  ${formatPrice(item.price)}
                </span>
              </div>
            </div>
            <button
              onClick={() =>
                addToCart({
                  id: String(item.id),
                  name: item.name,
                  price:
                    typeof item.price === "string"
                      ? parseFloat(item.price.replace(/[^0-9.]/g, ""))
                      : item.price,
                  image: item.image,
                  color: item.color || "Default",
                }, user)
              }
              className="bg-[#141718] text-white px-6 py-3 mt-1 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors w-full"
            >
              Add to cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
