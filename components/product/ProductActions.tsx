"use client";
import { Plus, Minus } from "lucide-react";
import { GoHeart, GoHeartFill } from "react-icons/go";

interface Props {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  isWishlisted: boolean;
  onWishlistToggle: () => void;
  onAddToCart: () => void;
}

export default function ProductActions({
  quantity,
  onDecrease,
  onIncrease,
  isWishlisted,
  onWishlistToggle,
  onAddToCart,
}: Props) {
  return (
    <div className="flex flex-col gap-4 py-6 border-b border-[#E8ECEF] w-full">
      <div className="flex gap-4 h-13">
        <div className="flex items-center justify-between bg-[#F3F5F7] rounded-lg w-30 px-4 font-medium">
          <button
            onClick={onDecrease}
            className="p-1 cursor-pointer hover:bg-gray-200 rounded text-[#141718] transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span>{quantity}</span>
          <button
            onClick={onIncrease}
            className="p-1 cursor-pointer hover:bg-gray-200 rounded text-[#141718] transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={onWishlistToggle}
          className="flex-1 flex cursor-pointer items-center justify-center gap-2 border border-[#141718] rounded-lg font-medium text-[16px] tracking-tight hover:bg-gray-50 transition-colors"
        >
          {isWishlisted ? (
            <GoHeartFill className="text-black text-xl" />
          ) : (
            <GoHeart className="text-xl" />
          )}
          Wishlist
        </button>
      </div>
      <button
        onClick={onAddToCart}
        className="w-full cursor-pointer scale-95 bg-[#141718] text-white rounded-lg h-13 font-medium text-[16px] tracking-tight hover:bg-black transition-colors"
      >
        Add to Cart
      </button>
    </div>
  );
}
