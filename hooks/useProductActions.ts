"use client";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { useAuthGuard } from "@/hooks/useAuthGuard";

interface ProductLike {
    id: number | string;
    title?: string;
    name?: string;
    price: number;
    mrp?: number;
    MRP?: number;
    old_price?: number;
    oldprice?: number;
    img?: string;
    image_url?: string;
    color?: string[] | string;
    stock?: number;
}

import { useAuth } from "@/context/AuthContext";

export function useProductActions() {
    const { user } = useAuth();
    const {
        items: wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
    } = useWishlistStore();
    const { addToCart } = useCartStore();
    const { requireAuth } = useAuthGuard();

    const handleWishlistToggle = (
        e: React.MouseEvent,
        product: ProductLike,
        color?: string,
    ) => {
        e.preventDefault();
        e.stopPropagation();

        const defaultColor = Array.isArray(product.color) 
            ? product.color[0] 
            : typeof product.color === 'string' 
                ? product.color 
                : "Default";
        
        const selectedColor = color || defaultColor;

        requireAuth(() => {
            if (wishlistItems.some((i) => i.id == product.id)) {
                removeFromWishlist(product.id, user);
            } else {
                addToWishlist({
                    id: product.id,
                    name: product.title || product.name || "",
                    price: product.price,
                    MRP:
                        product.mrp || product.MRP || product.old_price || product.oldprice,
                    image: product.img || product.image_url || "/image-1.png",
                    color: selectedColor,
                    stock: Number(product.stock) || 0,
                }, user);
            }
        });
    };

    const handleAddToCart = (
        e: React.MouseEvent,
        product: ProductLike,
        color?: string,
    ) => {
        e.preventDefault();
        e.stopPropagation();

        const defaultColor = Array.isArray(product.color) 
            ? product.color[0] 
            : typeof product.color === 'string' 
                ? product.color 
                : "Default";
        
        const selectedColor = color || defaultColor;

        requireAuth(() => {
            addToCart({
                id: String(product.id),
                name: product.title || product.name || "",
                price: product.price,
                image: product.img || product.image_url || "/image-1.png",
                color: selectedColor,
                stock: Number(product.stock) || 0,
            });
        });
    };

    return { handleWishlistToggle, handleAddToCart, wishlistItems, isInWishlist };
}
