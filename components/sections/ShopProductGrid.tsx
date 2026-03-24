"use client";
import { useIsMounted } from "@/hooks/useIsMounted";
import { useProductActions } from "@/hooks/useProductActions";
import { useProductRatings } from "@/hooks/useProductRatings";
import { useMemo } from "react";
import ShopProductCard from "./ShopProductCard";

import { Product } from "@/store/productStore";

interface ShopProductGridProps {
  products: Product[];
  viewGrid: number;
  mobileViewGrid?: number;
  visibleCount: number;
  setVisibleCount: (count: number | ((prev: number) => number)) => void;
  isSidebarOpen?: boolean;
}

const mobileGridClasses: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
};
const desktopGridClasses: Record<number, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

const ShopProductGrid = ({
  products,
  viewGrid,
  mobileViewGrid = 2,
  visibleCount,
  setVisibleCount,
}: ShopProductGridProps) => {
  const { handleWishlistToggle, handleAddToCart, wishlistItems, isInWishlist } =
    useProductActions();
  const isMounted = useIsMounted();
  const productIds = useMemo(() => products.map((p) => p.id), [products]);
  const { getRating } = useProductRatings(productIds);

  if (products.length === 0) {
    return (
      <div className="flex justify-center items-center py-20 text-[#6C7275]">
        <p>No products found tracking these filters.</p>
      </div>
    );
  }

  const gridClass = `${mobileGridClasses[mobileViewGrid] || "grid-cols-2"} ${desktopGridClasses[viewGrid] || "lg:grid-cols-4"}`;

  return (
    <>
      <div
        className={`grid gap-4 md:gap-6 pb-4 transition-all duration-300 ${gridClass}`}
      >
        {products.slice(0, visibleCount).map((card) => (
          <ShopProductCard
            key={card.id}
            card={card}
            viewGrid={viewGrid}
            mobileViewGrid={mobileViewGrid}
            isMounted={isMounted}
            isInWishlist={isInWishlist}
            wishlistItems={wishlistItems}
            handleWishlistToggle={handleWishlistToggle}
            handleAddToCart={handleAddToCart}
            getRating={getRating}
          />
        ))}
      </div>

      {products.length > visibleCount && (
        <div className="flex justify-center mt-12 mb-8">
          <button
            onClick={() => setVisibleCount((prev) => prev + 3)}
            className="px-10 py-2 border border-[#141718] text-[#141718] rounded-[80px] font-medium hover:bg-[#141718] hover:text-white transition-all duration-300"
          >
            Show more
          </button>
        </div>
      )}
    </>
  );
};

export default ShopProductGrid;
