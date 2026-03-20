"use client";
import { useEffect, useState, useMemo } from "react";
import { createClient } from "../../utils/supabase/client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useIsMounted } from "@/hooks/useIsMounted";
import { useProductActions } from "@/hooks/useProductActions";
import { useProductRatings } from "@/hooks/useProductRatings";
import ProductCard from "@/components/ui/ProductCard";

export default function YouMightAlsoLike() {
  const [products, setProducts] = useState<any[]>([]);
  const supabase = createClient();

  const { handleWishlistToggle, handleAddToCart, wishlistItems, isInWishlist } =
    useProductActions();
  const isMounted = useIsMounted();

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("status", "active")
        .limit(6);
      if (data) {
        setProducts(data);
      }
    }
    fetchProducts();
  }, []); // Remove supabase from dependency

  const displayProducts = useMemo(() => 
    products.length > 0 ? products : [], 
    [products]
  );

  const productIds = useMemo(
    () => displayProducts.map((p: any) => p.id),
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
        {displayProducts.map((card) => (
          <div key={card.id} className="w-62.5 md:w-70 shrink-0">
            <ProductCard
              product={card}
              isMounted={isMounted}
              isWishlisted={wishlistItems.some((i) => i.id == card.id)}
              onWishlistToggle={(e) => handleWishlistToggle(e, card)}
              onAddToCart={(e) => handleAddToCart(e, card)}
              linkTo={`/product/${card.id}`}
              avgRating={getRating(card.id).avgRating}
              reviewCount={getRating(card.id).reviewCount}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
