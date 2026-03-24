import { create } from 'zustand';
import { createClient } from '@/utils/supabase/client';

export interface Product {
    id: number | string;
    title: string;
    price: number;
    mrp?: number;
    img: string;
    category: string | string[];
    status: string;
    [key: string]: any;
}

interface ProductState {
    products: Product[];
    loading: boolean;
    error: any;
    lastFetched: number | null;
    fetchProducts: (force?: boolean) => Promise<void>;
    getProductById: (id: string | number) => Product | undefined;
}

export const useProductStore = create<ProductState>((set, get) => ({
    products: [],
    loading: false,
    error: null,
    lastFetched: null,

    fetchProducts: async (force = false) => {
        const { lastFetched, products } = get();
        const now = Date.now();
        
        // Skip fetching if already fetched within the last 5 minutes, unless forced
        if (!force && products.length > 0 && lastFetched && now - lastFetched < 5 * 60 * 1000) {
            return;
        }

        set({ loading: true, error: null });
        const supabase = createClient();
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('status', 'active');

        if (error) {
            set({ error, loading: false });
        } else {
            set({ products: data || [], loading: false, lastFetched: now });
        }
    },

    getProductById: (id) => {
        return get().products.find(p => String(p.id) === String(id));
    }
}));
