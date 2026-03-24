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
    const lastSearchQuery = useRef<string>("");
    const supabase = createClient();

    const searchProducts = useCallback(
        async (searchTerm: string) => {
            const trimmedTerm = searchTerm.trim();
            if (!trimmedTerm) {
                setResults([]);
                setLoading(false);
                lastSearchQuery.current = "";
                return;
            }

            // Don't search if the term is the same as the last successful search
            if (trimmedTerm === lastSearchQuery.current) {
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
                lastSearchQuery.current = trimmedTerm;
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
        lastSearchQuery.current = "";
    };

    return { query, results, loading, handleSearchChange, clearSearch };
}
