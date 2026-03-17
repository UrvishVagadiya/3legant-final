"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface RatingData {
    avgRating: number;
    reviewCount: number;
}

export function useProductRatings(productIds: (string | number)[]) {
    const [ratings, setRatings] = useState<Record<string, RatingData>>({});

    useEffect(() => {
        if (productIds.length === 0) return;

        const fetchRatings = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("product_reviews")
                .select("product_id, rating")
                .in(
                    "product_id",
                    productIds.map((id) => String(id))
                );

            if (error || !data) return;

            const grouped: Record<string, { sum: number; count: number }> = {};
            for (const row of data) {
                const pid = String(row.product_id);
                if (!grouped[pid]) grouped[pid] = { sum: 0, count: 0 };
                grouped[pid].sum += row.rating;
                grouped[pid].count += 1;
            }

            const result: Record<string, RatingData> = {};
            for (const [pid, val] of Object.entries(grouped)) {
                result[pid] = {
                    avgRating: val.sum / val.count,
                    reviewCount: val.count,
                };
            }
            setRatings(result);
        };

        fetchRatings();
    }, [productIds.join(",")]);

    const getRating = (productId: string | number): RatingData => {
        return ratings[String(productId)] || { avgRating: 0, reviewCount: 0 };
    };

    return { ratings, getRating };
}
