"use client";
import { useCallback, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface SearchProduct {
    id: number;
    title: string;
    img: string;
    price: number;
    mrp?: number;
    category?: string;
}

export function useProductSearch(limit = 8) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchProduct[]>([]);
    const [loading, setLoading] = useState(false);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const supabase = createClient();

    const searchProducts = useCallback(
        async (searchTerm: string) => {
            if (!searchTerm.trim()) {
                setResults([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            const { data, error } = await supabase
                .from("products")
                .select("*")
                .ilike("title", `%${searchTerm.trim()}%`)
                .limit(limit);

            if (!error && data) {
                setResults(data);
            } else {
                setResults([]);
            }
            setLoading(false);
        },
        [supabase, limit],
    );

    const handleSearchChange = (value: string) => {
        setQuery(value);
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            searchProducts(value);
        }, 300);
    };

    const clearSearch = () => {
        setQuery("");
        setResults([]);
    };

    return { query, results, loading, handleSearchChange, clearSearch };
}
