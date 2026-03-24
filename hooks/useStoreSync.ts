"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuth } from "@/context/AuthContext";

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

        if (!isAuthenticated) {
            useCartStore.setState({ items: [] });
            useWishlistStore.setState({ items: [] });
        }
    }, [isAuthenticated, userId, loadCartFromDb, loadWishlistFromDb]);
}
