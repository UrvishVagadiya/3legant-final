"use client";
import { GoHeart, GoHeartFill } from "react-icons/go";
import { RatingStars } from "@/components/ui/ProductCard";
import Link from "next/link";
import { isOfferExpired } from "@/utils/isOfferExpired";

interface Product {
  id: number;
  img: string;
  title: string;
  price: number;
  MRP: number;
  mrp?: number;
  category: string;
  isNew?: boolean;
  valid_until?: string | number | null;
  color?: string[] | string;
}

interface ShopProductCardProps {
  card: Product;
  viewGrid: number;
  mobileViewGrid: number;
  isMounted: boolean;
  isInWishlist: (id: number) => boolean;
  wishlistItems: any[];
  handleWishlistToggle: (e: React.MouseEvent, card: Product) => void;
  handleAddToCart: (e: React.MouseEvent, card: Product) => void;
  getRating: (id: number) => { avgRating: number };
}

const ShopProductCard = ({
  card,
  viewGrid,
  mobileViewGrid,
  isMounted,
  isInWishlist,
  wishlistItems,
  handleWishlistToggle,
  handleAddToCart,
  getRating,
}: ShopProductCardProps) => {
  const expired = isOfferExpired(card.valid_until);
  const rawMrp = card.mrp || card.MRP || 0;
  const displayPrice = expired && rawMrp > card.price ? rawMrp : card.price;
  const displayMrp = expired ? 0 : rawMrp;
  const isHorizontal = viewGrid <= 2;
  const isMobileExtended = mobileViewGrid === 1;
  const overlayClass = `${isMobileExtended ? "hidden" : "block"} ${isHorizontal ? "lg:!hidden" : "lg:!block"}`;
  const extendedClass = `${isMobileExtended ? "block" : "hidden"} ${isHorizontal ? "lg:!block" : "lg:!hidden"}`;

  return (
    <Link
      href={`/product/${card.id}`}
      className={`group relative flex flex-col ${isHorizontal ? "lg:flex-row lg:gap-6" : ""}`}
    >
      <div
        className={`relative bg-[#F3F5F7] flex items-center justify-center overflow-hidden rounded w-full aspect-4/5 ${isHorizontal ? "lg:w-65 lg:shrink-0 lg:aspect-square" : ""}`}
      >
        <img
          className="w-full h-full object-cover object-center mix-blend-multiply"
          src={card.img}
          alt={card.title}
        />

        <div className="w-full absolute top-0 p-3 flex justify-between items-start z-10">
          <div className="flex flex-col gap-2">
            {card.isNew && (
              <div className="bg-[#FFFFFF] text-[#141718] font-bold text-[10px] md:text-xs py-1 px-2.5 rounded flex justify-center items-center shadow-sm">
                NEW
              </div>
            )}
            {displayMrp > displayPrice && (
              <div className="bg-[#38CB89] text-white font-bold text-[10px] md:text-xs py-1 px-2.5 rounded flex justify-center items-center shadow-sm">
                -{Math.round(((displayMrp - displayPrice) / displayMrp) * 100)}%
              </div>
            )}
          </div>
          <div className={`${isHorizontal ? "lg:hidden" : ""}`}>
            <div
              onClick={(e) => handleWishlistToggle(e, card)}
              className={`${isMounted && wishlistItems.some((i) => i.id == card.id) ? "opacity-100" : "opacity-0 group-hover:opacity-100"} bg-white cursor-pointer w-8 h-8 shadow-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110`}
            >
              {isMounted && wishlistItems.some((i) => i.id == card.id) ? (
                <GoHeartFill className="text-black text-lg" />
              ) : (
                <GoHeart className="text-[#6C7275] text-lg" />
              )}
            </div>
          </div>
        </div>

        <div
          onClick={(e) => handleAddToCart(e, card)}
          className={`absolute opacity-0 group-hover:opacity-100 transition-all duration-300 left-3 right-3 md:left-4 md:right-4 bottom-3 md:bottom-4 py-2 md:py-3 rounded-lg bg-black text-center cursor-pointer shadow-lg hover:bg-gray-800 hover:scale-[1.02] ${overlayClass}`}
        >
          <h2 className="text-white font-medium text-sm md:text-base">
            Add to cart
          </h2>
        </div>
      </div>

      <div
        className={`mt-3 ${isHorizontal ? "lg:mt-0 lg:flex-1 lg:flex lg:flex-col lg:justify-center lg:py-2" : ""}`}
      >
        <div
          className={`flex text-[#141718] mb-1.5 md:mb-2 text-[14px] ${isHorizontal ? "lg:text-base lg:mt-2" : ""}`}
        >
          <RatingStars rating={getRating(card.id).avgRating} />
        </div>
        <h3
          className={`font-semibold text-[#141718] mb-1 truncate text-[15px] ${isHorizontal ? "lg:text-lg lg:mb-2" : ""}`}
        >
          {card.title}
        </h3>
        <div className="flex gap-2.5 items-center mt-0.5">
          <p
            className={`font-semibold text-[#141718] text-sm ${isHorizontal ? "lg:text-lg" : ""}`}
          >
            ${Number(displayPrice).toFixed(2)}
          </p>
          {displayMrp > 0 && displayMrp > displayPrice && (
            <p
              className={`line-through text-[#6C7275] text-xs ${isHorizontal ? "lg:text-base" : ""}`}
            >
              ${Number(displayMrp).toFixed(2)}
            </p>
          )}
        </div>

        <div className={extendedClass}>
          <p className="mt-3 lg:mt-4 text-[#6C7275] text-xs lg:text-sm line-clamp-2 lg:line-clamp-3 mb-4 lg:mb-6 pr-4">
            Super-soft cushion cover in off-white with a tactile pattern that
            enhances the different tones in the pile and base.
          </p>
          <div className="flex flex-col gap-3 lg:gap-4 lg:max-w-70">
            <button
              onClick={(e) => handleAddToCart(e, card)}
              className="w-full py-2.5 lg:py-3 bg-[#141718] text-white rounded font-medium text-sm lg:text-[15px] hover:bg-black transition-colors"
            >
              Add to cart
            </button>
            <button
              onClick={(e) => handleWishlistToggle(e, card)}
              className="w-full flex items-center justify-center gap-2 text-[#141718] font-medium text-sm lg:text-[15px] hover:text-[#6C7275] transition-colors"
            >
              {isMounted && isInWishlist(card.id) ? (
                <GoHeartFill className="text-black text-lg lg:text-xl" />
              ) : (
                <GoHeart className="text-lg lg:text-xl" />
              )}
              Wishlist
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ShopProductCard;
