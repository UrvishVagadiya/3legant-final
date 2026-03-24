"use client";

import { useEffect} from "react";

interface RatingData {
    avgRating: number;
    reviewCount: number;
}

import { useReviewStore } from "@/store/reviewStore";

export function useProductRatings(productIds: (string | number)[]) {
    const { ratingsByProduct, fetchRatings } = useReviewStore();

    useEffect(() => {
        if (productIds.length === 0) return;
        fetchRatings(productIds);
    }, [productIds.join(","), fetchRatings]);

    const getRating = (productId: string | number): RatingData => {
        return ratingsByProduct[String(productId)] || { avgRating: 0, reviewCount: 0 };
    };

    return { ratings: ratingsByProduct, getRating };
}
