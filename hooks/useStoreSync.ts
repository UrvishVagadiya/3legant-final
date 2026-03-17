"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

/**
 * Hook that syncs cart/wishlist from Supabase when user is authenticated.
 * Call this once in a top-level layout component.
 */
export function useStoreSync() {
    const loadCartFromDb = useCartStore((s) => s.loadCartFromDb);
    const loadWishlistFromDb = useWishlistStore((s) => s.loadWishlistFromDb);

    useEffect(() => {
        const supabase = createClient();

        const syncStores = async () => {
            const { data } = await supabase.auth.getUser();
            if (data?.user) {
                await Promise.all([loadCartFromDb(), loadWishlistFromDb()]);
            }
        };

        syncStores();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === "SIGNED_IN") {
                syncStores();
            }
            if (event === "SIGNED_OUT") {
                useCartStore.setState({ items: [] });
                useWishlistStore.setState({ items: [] });
            }
        });

        return () => { subscription.unsubscribe(); };
    }, [loadCartFromDb, loadWishlistFromDb]);
}
