import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@/utils/supabase/client';

export interface WishlistItem {
    id: number | string;
    name: string;
    price: number | string;
    image: string;
    color?: string;
    MRP?: number;
}

interface WishlistState {
    items: WishlistItem[];
    syncing: boolean;
    addToWishlist: (item: WishlistItem, user?: any) => void;
    removeFromWishlist: (id: number | string, user?: any) => void;
    isInWishlist: (id: number | string) => boolean;
    syncWishlistToDb: (user?: any) => Promise<void>;
    loadWishlistFromDb: (user?: any) => Promise<void>;
}


export const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            items: [],
            syncing: false,

            addToWishlist: (item, user?: any) => {
                set((state) => {
                    if (!state.items.find((i) => i.id == item.id)) {
                        return { items: [...state.items, item] };
                    }
                    return state;
                });
                if (user) {
                    const supabase = createClient();
                    supabase.from('wishlist').upsert({
                        user_id: user.id,
                        product_id: String(item.id),
                    }, { onConflict: 'user_id,product_id' }).then();
                }
            },

            removeFromWishlist: (id, user?: any) => {
                set((state) => ({ items: state.items.filter((item) => item.id != id) }));
                if (user) {
                    const supabase = createClient();
                    supabase.from('wishlist').delete()
                        .eq('user_id', user.id)
                        .eq('product_id', String(id)).then();
                }
            },

            isInWishlist: (id) => get().items.some((item) => item.id == id),

            syncWishlistToDb: async (user?: any) => {
                if (!user) return;
                const supabase = createClient();
                const items = get().items;
                await supabase.from('wishlist').delete().eq('user_id', user.id);
                if (items.length === 0) return;
                const rows = items.map(item => ({
                    user_id: user.id,
                    product_id: String(item.id),
                }));
                await supabase.from('wishlist').insert(rows);
            },

            loadWishlistFromDb: async (user?: any) => {
                if (!user) return;
                set({ syncing: true });
                const supabase = createClient();
                const { data, error } = await supabase
                    .from('wishlist')
                    .select('*, products(id, title, price, mrp, img)')
                    .eq('user_id', user.id);

                if (!error && data && data.length > 0) {
                    const dbItems: WishlistItem[] = data.map((row: any) => ({
                        id: row.product_id,
                        name: row.products?.title || '',
                        price: row.products?.price || 0,
                        MRP: row.products?.mrp ? Number(row.products.mrp) : undefined,
                        image: row.products?.img || '/image-1.png',
                    }));
                    set({ items: dbItems });
                }
                set({ syncing: false });
            },
        }),
        {
            name: 'wishlist-storage',
        }
    )
);
