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
    addToWishlist: (item: WishlistItem) => void;
    removeFromWishlist: (id: number | string) => void;
    isInWishlist: (id: number | string) => boolean;
    syncWishlistToDb: () => Promise<void>;
    loadWishlistFromDb: () => Promise<void>;
}

async function getUser() {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    return data?.user ?? null;
}

export const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            items: [],
            syncing: false,

            addToWishlist: (item) => {
                set((state) => {
                    if (!state.items.find((i) => i.id == item.id)) {
                        return { items: [...state.items, item] };
                    }
                    return state;
                });
                (async () => {
                    const user = await getUser();
                    if (!user) return;
                    const supabase = createClient();
                    await supabase.from('wishlist').upsert({
                        user_id: user.id,
                        product_id: String(item.id),
                    }, { onConflict: 'user_id,product_id' });
                })();
            },

            removeFromWishlist: (id) => {
                set((state) => ({ items: state.items.filter((item) => item.id != id) }));
                (async () => {
                    const user = await getUser();
                    if (!user) return;
                    const supabase = createClient();
                    await supabase.from('wishlist').delete()
                        .eq('user_id', user.id)
                        .eq('product_id', String(id));
                })();
            },

            isInWishlist: (id) => get().items.some((item) => item.id == id),

            syncWishlistToDb: async () => {
                const user = await getUser();
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

            loadWishlistFromDb: async () => {
                const user = await getUser();
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
