"use client";
import Link from "next/link";
import { useState } from "react";
import { MdKeyboardArrowRight } from "react-icons/md";
import { IoMdStar, IoMdStarOutline, IoMdStarHalf } from "react-icons/io";
import { useWishlistStore } from "../../store/wishlistStore";
import { useCartStore } from "../../store/cartStore";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useIsMounted } from "@/hooks/useIsMounted";
import YouMightAlsoLike from "./YouMightAlsoLike";
import CountdownTimer from "./CountdownTimer";
import ColorSelector from "./ColorSelector";
import { isOfferExpired } from "@/utils/isOfferExpired";
import ProductActions from "./ProductActions";
import AccordionItem from "./AccordionItem";
import AdditionalInfo from "./AdditionalInfo";
import FAQList from "./FAQList";
import ReviewsSection, { useProductReviews } from "./ReviewsSection";

const refImages = [
  "/table.png",
  "/image-1.png",
  "/image-2.png",
  "/table10.png",
  "/table3.png",
  "/table5.png",
];

export const DisplayProduct = ({ p }: { p: any }) => {
  const isMounted = useIsMounted();
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState<string | null>("");
  const colorOptions: string[] = Array.isArray(p.color)
    ? p.color
    : p.color
      ? [p.color]
      : ["Black"];
  const [selectedColor, setSelectedColor] = useState(
    colorOptions[0] || "Black",
  );
  const reviews = useProductReviews(p.id);
  const {
    items: wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  } = useWishlistStore();
  const { addToCart, updateQuantity, items: cartItems } = useCartStore();
  const { requireAuth } = useAuthGuard();

  const pid = p.id || p.sku;
  const expired = isOfferExpired(p.validUntil);
  const rawPrice =
    typeof p.price === "number"
      ? p.price
      : parseFloat(String(p.price).replace("$", ""));
  const rawMrp =
    typeof (p.mrp || p.oldprice) === "number"
      ? p.mrp || p.oldprice
      : parseFloat(String(p.mrp || p.oldprice).replace("$", ""));
  const price = expired && rawMrp > rawPrice ? rawMrp : rawPrice;
  const mrp = expired ? 0 : rawMrp;
  const img = (p.name?.toLowerCase().includes("table") || p.title?.toLowerCase().includes("table"))
    ? `/${selectedColor.toLowerCase()}_table.png`
    : p.img || p.image_url || refImages[0];

  const handleWishlistToggle = () =>
    requireAuth(() => {
      if (isInWishlist(pid)) removeFromWishlist(pid);
      else
        addToWishlist({
          id: pid,
          name: p.name || "Tray Table",
          price,
          MRP: mrp,
          image: refImages[0],
          color: selectedColor,
        });
    });

  const handleAddToCart = () =>
    requireAuth(() => {
      addToCart({
        id: String(pid),
        name: p.name || p.title || "Tray Table",
        price,
        image: img,
        color: selectedColor,
      });
      if (quantity > 1)
        setTimeout(
          () => updateQuantity(String(pid), selectedColor, quantity),
          0,
        );
    });

  if (!isMounted) return null;

  return (
    <div className="w-full max-w-full overflow-x-hidden px-4 md:px-8 xl:px-40 py-4 md:py-10">
      <div className="flex flex-wrap items-center gap-3 text-[14px] font-medium mb-8 text-[#6C7275]">
        <Link href="/" className="hover:text-[#141718] transition-colors">
          Home
        </Link>
        <MdKeyboardArrowRight className="text-xl" />
        <Link href="/shop" className="hover:text-[#141718] transition-colors">
          Shop
        </Link>
        {p.category && (
          <>
            <MdKeyboardArrowRight className="text-xl" />
            <Link href='/shop'>
              <span className="hover:text-[#141718] transition-colors cursor-pointer capitalize">
                {Array.isArray(p.category)
                  ? p.category[0]
                  : String(p.category).split(",")[0].trim()}
              </span>
            </Link>
          </>
        )}
        <MdKeyboardArrowRight className="text-xl" />
        <span className="text-[#141718]">{p.name || "Product"}</span>
      </div>

      <div className="w-full max-w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 relative overflow-hidden">
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative w-full aspect-3/4 bg-[#F3F5F7] group mb-4 sm:mb-0">
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {p.isNew && (
                  <span className="bg-white text-black text-sm font-bold px-3 py-1 rounded w-fit">
                    NEW
                  </span>
                )}
                {!expired && ((p.mrp ?? 0) > p.price || (p.oldprice ?? 0) > p.price) && (
                  <span className="bg-[#38CB89] text-white text-sm font-bold px-3 py-1 rounded w-fit">
                    -
                    {Math.round(
                      (((p.mrp || p.oldprice) - p.price) /
                        (p.mrp || p.oldprice)) *
                      100,
                    )}
                    %
                  </span>
                )}
              </div>
              <img
                src={img}
                alt="Product view 1"
                className="w-full h-full max-w-full object-cover object-center"
              />
            </div>
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="relative w-full aspect-3/4 bg-[#F3F5F7] hidden sm:block"
              >
                <img
                  src={refImages[n]}
                  alt={`Product view ${n + 1}`}
                  className="w-full h-full max-w-full object-cover object-center"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="w-full lg:sticky lg:top-10 h-fit flex flex-col gap-6">
          <div className="flex flex-col gap-4 border-b border-[#E8ECEF] pb-6">
            <div className="flex items-center gap-2">
              <div className="flex text-[#141718] text-[14px]">
                {[1, 2, 3, 4, 5].map((s) =>
                  reviews.avg >= s ? (
                    <IoMdStar key={s} />
                  ) : reviews.avg >= s - 0.5 ? (
                    <IoMdStarHalf key={s} />
                  ) : (
                    <IoMdStarOutline key={s} />
                  ),
                )}
              </div>
              <span className="text-[#141718] text-sm">
                {reviews.reviews.length} Review
                {reviews.reviews.length !== 1 ? "s" : ""}
              </span>
            </div>
            <h1 className="font-poppins text-3xl md:text-[40px] font-medium leading-tight text-[#141718]">
              {p.name || "Tray Table"}
            </h1>
            <p className="text-[#6C7275] text-[16px] leading-6.5">
              {p.description ||
                "Buy one or buy a few and make every space where you sit more convenient. Light and easy to move around with removable tray top, handy for serving snacks."}
            </p>
            <div className="flex items-center gap-3">
              <p className="text-[28px] font-medium text-[#141718] tracking-tight">
                ${price.toFixed(2)}
              </p>
              {mrp > 0 && mrp > price && (
                <p className="text-[20px] font-medium text-[#6C7275] line-through">
                  ${mrp.toFixed(2)}
                </p>
              )}
            </div>
          </div>

          {!expired && <CountdownTimer validUntil={p.validUntil} />}
          <ColorSelector
            colors={colorOptions}
            selected={selectedColor}
            onSelect={setSelectedColor}
            measurements={p.measurements}
          />
          <ProductActions
            quantity={quantity}
            onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
            onIncrease={() => setQuantity((q) => q + 1)}
            isWishlisted={isMounted && wishlistItems.some((i) => i.id == pid)}
            onWishlistToggle={handleWishlistToggle}
            onAddToCart={handleAddToCart}
          />

          <div className="flex flex-col gap-3 py-2 text-[#6C7275] text-[12px]">
            <div className="flex uppercase">
              <span className="w-24">SKU</span>
              <span className="text-[#141718]">{p.sku || "1117"}</span>
            </div>
            <div className="flex uppercase">
              <span className="w-24">CATEGORY</span>
              <span className="text-[#141718] capitalize">
                {Array.isArray(p.category)
                  ? p.category.join(", ")
                  : p.category || "Living Room, Bedroom"}
              </span>
            </div>
          </div>

          <div className="flex flex-col pt-4">
            <AccordionItem
              id="details"
              title="Additional Info"
              isOpen={openAccordion === "details"}
              onToggle={(id) =>
                setOpenAccordion(openAccordion === id ? null : id)
              }
            >
              <AdditionalInfo measurements={p.measurements} weight={p.weight} />
            </AccordionItem>
            <AccordionItem
              id="questions"
              title="Questions"
              isOpen={openAccordion === "questions"}
              onToggle={(id) =>
                setOpenAccordion(openAccordion === id ? null : id)
              }
              maxHeight="max-h-[600px]"
            >
              <FAQList />
            </AccordionItem>
            <AccordionItem
              id="reviews"
              title={`Reviews (${reviews.reviews.length})`}
              isOpen={openAccordion === "reviews"}
              onToggle={(id) =>
                setOpenAccordion(openAccordion === id ? null : id)
              }
              maxHeight="max-h-[800px]"
              borderClass="border-y border-[#E8ECEF]"
            >
              <ReviewsSection productName={p.name || "Product"} r={reviews} />
            </AccordionItem>
          </div>
        </div>
      </div>
      <YouMightAlsoLike />
    </div>
  );
};
