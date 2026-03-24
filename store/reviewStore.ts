import { create } from 'zustand';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';

const supabase = createClient();

interface RatingData {
    avgRating: number;
    reviewCount: number;
}

interface ReviewState {
    reviewsByProduct: Record<string, any[]>;
    ratingsByProduct: Record<string, RatingData>;
    loading: boolean;
    fetchReviews: (productId: string, userId?: string) => Promise<void>;
    fetchRatings: (productIds: (string | number)[]) => Promise<void>;
    addReview: (productId: string, userId: string, userName: string, rating: number, review: string) => Promise<void>;
    updateReview: (productId: string, reviewId: string, rating: number, review: string) => Promise<void>;
    deleteReview: (productId: string, reviewId: string, userId: string) => Promise<void>;
    toggleLike: (productId: string, reviewId: string, userId: string) => Promise<void>;
    addReply: (productId: string, reviewId: string, userId: string, userName: string, reply: string) => Promise<void>;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
    reviewsByProduct: {},
    ratingsByProduct: {},
    loading: false,

    fetchReviews: async (productId, userId) => {
        const state = get();
        const now = Date.now();
        const lastFetched = (state as any).lastFetchedByProduct?.[productId] || 0;

        if (now - lastFetched < 5 * 60 * 1000 && state.reviewsByProduct[productId]) {
            return;
        }

        set({ loading: true });
        const { data: reviews } = await supabase
            .from("product_reviews")
            .select("*, review_likes(user_id), review_replies(*)")
            .eq("product_id", productId)
            .order("created_at", { ascending: false });

        if (reviews) {
            const formatted = reviews.map((r: any) => ({
                ...r,
                likes_count: r.review_likes?.length || 0,
                liked: r.review_likes?.some((l: any) => l.user_id === userId) || false,
                replies: r.review_replies || []
            }));

            const avgRating = formatted.length > 0
                ? formatted.reduce((sum: number, r: any) => sum + r.rating, 0) / formatted.length
                : 0;

            set(state => ({
                reviewsByProduct: { ...state.reviewsByProduct, [productId]: formatted },
                ratingsByProduct: {
                    ...state.ratingsByProduct,
                    [productId]: { avgRating, reviewCount: formatted.length }
                },
                lastFetchedByProduct: { ...(state as any).lastFetchedByProduct, [productId]: now },
                loading: false
            }));
        } else {
            set({ loading: false });
        }
    },

    fetchRatings: async (productIds) => {
        if (productIds.length === 0) return;

        const state = get();
        const idsToFetch = productIds
            .map(id => String(id))
            .filter(id => !state.ratingsByProduct[id]);

        if (idsToFetch.length === 0) return;

        const { data, error } = await supabase
            .from("product_reviews")
            .select("product_id, rating")
            .in("product_id", idsToFetch);

        if (error || !data) return;

        const grouped: Record<string, { sum: number; count: number }> = {};
        for (const row of data) {
            const pid = String(row.product_id);
            if (!grouped[pid]) grouped[pid] = { sum: 0, count: 0 };
            grouped[pid].sum += row.rating;
            grouped[pid].count += 1;
        }

        const newRatings: Record<string, RatingData> = {};
        for (const [pid, val] of Object.entries(grouped)) {
            newRatings[pid] = {
                avgRating: val.sum / val.count,
                reviewCount: val.count,
            };
        }

        for (const id of idsToFetch) {
            if (!newRatings[id]) {
                newRatings[id] = { avgRating: 0, reviewCount: 0 };
            }
        }

        set(state => ({
            ratingsByProduct: { ...state.ratingsByProduct, ...newRatings }
        }));
    },

    addReview: async (productId, userId, userName, rating, review) => {
        const { data, error } = await supabase
            .from("product_reviews")
            .insert({ product_id: productId, user_id: userId, user_name: userName, rating, review })
            .select()
            .single();

        if (!error && data) {
            const newReview = { ...data, liked: false, likes_count: 0, replies: [] };
            set(state => {
                const currentReviews = state.reviewsByProduct[productId] || [];
                const updatedReviews = [newReview, ...currentReviews];
                const avgRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;

                return {
                    reviewsByProduct: { ...state.reviewsByProduct, [productId]: updatedReviews },
                    ratingsByProduct: {
                        ...state.ratingsByProduct,
                        [productId]: { avgRating, reviewCount: updatedReviews.length }
                    }
                };
            });
            toast.success("Review submitted!");
        } else {
            toast.error(error?.message || "Failed to submit review");
        }
    },

    updateReview: async (productId, reviewId, rating, review) => {
        const { data, error } = await supabase
            .from("product_reviews")
            .update({ rating, review })
            .eq("id", reviewId)
            .select()
            .single();

        if (!error && data) {
            set(state => {
                const updatedReviews = (state.reviewsByProduct[productId] || []).map(r =>
                    r.id === reviewId ? { ...r, ...data } : r
                );
                const avgRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;

                return {
                    reviewsByProduct: { ...state.reviewsByProduct, [productId]: updatedReviews },
                    ratingsByProduct: {
                        ...state.ratingsByProduct,
                        [productId]: { avgRating, reviewCount: updatedReviews.length }
                    }
                };
            });
            toast.success("Review updated!");
        } else {
            toast.error(error?.message || "Failed to update review");
        }
    },

    deleteReview: async (productId, reviewId, userId) => {
        const { error } = await supabase.from("product_reviews").delete().eq("id", reviewId).eq("user_id", userId);
        if (!error) {
            set(state => {
                const updatedReviews = (state.reviewsByProduct[productId] || []).filter(r => r.id !== reviewId);
                const avgRating = updatedReviews.length > 0
                    ? updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length
                    : 0;

                return {
                    reviewsByProduct: { ...state.reviewsByProduct, [productId]: updatedReviews },
                    ratingsByProduct: {
                        ...state.ratingsByProduct,
                        [productId]: { avgRating, reviewCount: updatedReviews.length }
                    }
                };
            });
            toast.success("Review deleted");
        } else {
            toast.error("Failed to delete review");
        }
    },

    toggleLike: async (productId, reviewId, userId) => {
        const productReviews = get().reviewsByProduct[productId] || [];
        const review = productReviews.find(r => r.id === reviewId);
        if (!review) return;

        if (review.liked) {
            await supabase.from("review_likes").delete().eq("review_id", reviewId).eq("user_id", userId);
            set(state => ({
                reviewsByProduct: {
                    ...state.reviewsByProduct,
                    [productId]: (state.reviewsByProduct[productId] || []).map(r =>
                        r.id === reviewId ? { ...r, liked: false, likes_count: Math.max(0, r.likes_count - 1) } : r
                    )
                }
            }));
        } else {
            await supabase.from("review_likes").insert({ review_id: reviewId, user_id: userId });
            set(state => ({
                reviewsByProduct: {
                    ...state.reviewsByProduct,
                    [productId]: (state.reviewsByProduct[productId] || []).map(r =>
                        r.id === reviewId ? { ...r, liked: true, likes_count: r.likes_count + 1 } : r
                    )
                }
            }));
        }
    },

    addReply: async (productId, reviewId, userId, userName, reply) => {
        const { data, error } = await supabase
            .from("review_replies")
            .insert({ review_id: reviewId, user_id: userId, user_name: userName, reply })
            .select()
            .single();

        if (!error && data) {
            set(state => ({
                reviewsByProduct: {
                    ...state.reviewsByProduct,
                    [productId]: (state.reviewsByProduct[productId] || []).map(r =>
                        r.id === reviewId ? { ...r, replies: [...(r.replies || []), data] } : r
                    )
                }
            }));
            toast.success("Reply posted!");
        }
    }
}));
