"use client";
import { useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useIsMounted } from "@/hooks/useIsMounted";
import { useProductActions } from "@/hooks/useProductActions";
import { useProductRatings } from "@/hooks/useProductRatings";
import ProductCard from "@/components/ui/ProductCard";
import { Product, useProductStore } from "@/store/productStore";

export default function YouMightAlsoLike() {
  const { products: allProducts, fetchProducts } = useProductStore();
  const { wishlistItems } = useProductStore() as any;
  const { handleWishlistToggle, handleAddToCart } =
    useProductActions();
  const isMounted = useIsMounted();

  const products = useMemo(() => {
    if (allProducts.length === 0) return [];
    const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6) as Product[];
  }, [allProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const displayProducts = useMemo(() =>
    products.length > 0 ? products : [],
    [products]
  );

  const productIds = useMemo(
    () => displayProducts.map((p: Product) => p.id),
    [displayProducts],
  );
  const { getRating } = useProductRatings(productIds);

  return (
    <div className="w-full mt-10 md:mt-20">
      <div className="flex justify-between items-end mb-8">
        <h2 className="text-2xl md:text-[34px] font-medium font-poppins">
          You might also like
        </h2>
        <Link
          href="/shop"
          className="group flex items-center gap-1 text-[16px] font-medium hover:text-gray-600 transition-colors border-b-2 border-black pb-0.5"
        >
          More Products{" "}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="flex overflow-x-auto gap-4 md:gap-6 pb-4">
        {displayProducts.map((card: Product) => (
          <div key={card.id} className="w-62.5 md:w-70 shrink-0">
            <ProductCard
              product={card}
              isMounted={isMounted}
              isWishlisted={wishlistItems?.some((i: any) => i.id == card.id)}
              onWishlistToggle={(e) => handleWishlistToggle(e, card)}
              onAddToCart={(e) => handleAddToCart(e, card)}
              linkTo={`/product/${card.id}`}
              avgRating={getRating(card.id).avgRating}
              reviewCount={getRating(card.id).reviewCount}
              showColors={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
