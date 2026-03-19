"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

/**
 * Hook that syncs cart/wishlist from Supabase when user is authenticated.
 * Call this once in a top-level layout component.
 */
import { useAuth } from "@/context/AuthContext";

/**
 * Hook that syncs cart/wishlist from Supabase when user is authenticated.
 * Call this once in a top-level layout component.
 */
export function useStoreSync() {
    const { user, isAuthenticated } = useAuth();
    const loadCartFromDb = useCartStore((s) => s.loadCartFromDb);
    const loadWishlistFromDb = useWishlistStore((s) => s.loadWishlistFromDb);

    const userId = user?.id;

    useEffect(() => {
        const syncStores = async () => {
            if (isAuthenticated && user) {
                await Promise.all([loadCartFromDb(user), loadWishlistFromDb(user)]);
            }
        };

        syncStores();

        // Handle case where user signs out
        if (!isAuthenticated) {
            useCartStore.setState({ items: [] });
            useWishlistStore.setState({ items: [] });
        }
    }, [isAuthenticated, userId, loadCartFromDb, loadWishlistFromDb]);
}
