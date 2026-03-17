import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';
import { createClient } from '@/utils/supabase/client';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    color: string;
    quantity: number;
}

interface CartState {
    isCartOpen: boolean;
    items: CartItem[];
    shippingMethod: string;
    syncing: boolean;
    toggleCart: () => void;
    addToCart: (item: Omit<CartItem, 'quantity'>) => void;
    removeFromCart: (id: string, color: string) => void;
    updateQuantity: (id: string, color: string, quantity: number) => void;
    setShippingMethod: (method: string) => void;
    clearCart: () => void;
    syncCartToDb: () => Promise<void>;
    loadCartFromDb: () => Promise<void>;
}

async function getUser() {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    return data?.user ?? null;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            isCartOpen: false,
            items: [],
            shippingMethod: 'free',
            syncing: false,
            toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
            setShippingMethod: (method) => set({ shippingMethod: method }),

            addToCart: (item) => {
                const safeItem = { ...item, price: Number(item.price) };
                set((state) => {
                    const existingItem = state.items.find(i => i.id === safeItem.id && i.color === safeItem.color);
                    if (existingItem) {
                        return { items: state.items.map(i => (i.id === safeItem.id && i.color === safeItem.color) ? { ...i, quantity: i.quantity + 1 } : i) };
                    }
                    return { items: [...state.items, { ...safeItem, quantity: 1 }] };
                });
                toast.success(`${item.name} added to cart!`, {
                    style: { borderRadius: '8px', background: '#141718', color: '#fff' },
                });
                get().syncCartToDb();
            },

            removeFromCart: (id, color) => {
                set((state) => ({ items: state.items.filter(i => !(i.id === id && i.color === color)) }));
                get().syncCartToDb();
            },

            updateQuantity: (id, color, quantity) => {
                set((state) => ({
                    items: state.items.map(i => (i.id === id && i.color === color) ? { ...i, quantity: Math.max(1, quantity) } : i)
                }));
                get().syncCartToDb();
            },

            clearCart: () => {
                set({ items: [] });
                (async () => {
                    const user = await getUser();
                    if (!user) return;
                    const supabase = createClient();
                    await supabase.from('cart').delete().eq('user_id', user.id);
                })();
            },

            syncCartToDb: async () => {
                const user = await getUser();
                if (!user) return;
                const supabase = createClient();
                const items = get().items;

                await supabase.from('cart').delete().eq('user_id', user.id);

                if (items.length === 0) return;

                const rows = items.map(item => ({
                    user_id: user.id,
                    product_id: item.id,
                    quantity: item.quantity,
                    color: item.color,
                }));
                await supabase.from('cart').insert(rows);
            },

            loadCartFromDb: async () => {
                const user = await getUser();
                if (!user) return;
                set({ syncing: true });
                const supabase = createClient();
                const { data, error } = await supabase
                    .from('cart')
                    .select('*, products(id, title, price, img)')
                    .eq('user_id', user.id);

                if (!error && data && data.length > 0) {
                    const dbItems: CartItem[] = data.map((row: any) => ({
                        id: row.product_id,
                        name: row.products?.title || '',
                        price: Number(row.products?.price) || 0,
                        image: row.products?.img || '/image-1.png',
                        color: row.color || 'Default',
                        quantity: row.quantity,
                    }));
                    set({ items: dbItems });
                }
                set({ syncing: false });
            },
        }),
        {
            name: 'cart-storage',
            partialize: (state) => ({ items: state.items, shippingMethod: state.shippingMethod })
        }
    )
);
