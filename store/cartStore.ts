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
    setShippingMethod: (method: string) => void;
    clearCart: (user?: any) => void;
    syncCartToDb: (user?: any) => Promise<void>;
    loadCartFromDb: (user?: any) => Promise<void>;
    addToCart: (item: Omit<CartItem, 'quantity'>, user?: any) => void;
    removeFromCart: (id: string, color: string, user?: any) => void;
    updateQuantity: (id: string, color: string, quantity: number, user?: any) => void;
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

            addToCart: (item, user?: any) => {
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
                get().syncCartToDb(user);
            },

            removeFromCart: (id, color, user?: any) => {
                set((state) => ({ items: state.items.filter(i => !(i.id === id && i.color === color)) }));
                get().syncCartToDb(user);
            },

            updateQuantity: (id, color, quantity, user?: any) => {
                set((state) => ({
                    items: state.items.map(i => (i.id === id && i.color === color) ? { ...i, quantity: Math.max(1, quantity) } : i)
                }));
                get().syncCartToDb(user);
            },

            clearCart: async (user?: any) => {
                set({ items: [] });
                if (!user) return;
                const supabase = createClient();
                await supabase.from('cart').delete().eq('user_id', user.id);
            },

            syncCartToDb: async (user?: any) => {
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

            loadCartFromDb: async (user?: any) => {
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
