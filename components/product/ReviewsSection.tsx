"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import { Stars, ReviewForm, ReviewCard } from "./ReviewParts";
import { useAuth } from "@/context/AuthContext";

interface ReviewLikes {
  [reviewId: string]: { count: number; liked: boolean };
}

interface ReviewReply {
  id: string;
  review_id: string;
  user_id: string;
  user_name: string;
  reply: string;
  created_at: string;
}

interface ReviewReplies {
  [reviewId: string]: ReviewReply[];
}

export function useProductReviews(productId: string | undefined) {
  const { user, session: authSession } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [sortOption, setSortOption] = useState("Newest");
  const [isEditing, setIsEditing] = useState(false);
  const [userReview, setUserReview] = useState<any>(null);
  const [likes, setLikes] = useState<ReviewLikes>({});
  const [replies, setReplies] = useState<ReviewReplies>({});
  const supabase = createClient();

  useEffect(() => {
    if (!productId) return;
    (async () => {
      const { data: reviewsData } = await supabase
        .from("product_reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      const allReviews = reviewsData || [];
      const reviewIds = allReviews.map((r: any) => r.id);

      // Fetch likes and replies in parallel
      const [userLikesResult, repliesResult] = await Promise.all([
        user?.id
          ? supabase
            .from("review_likes")
            .select("review_id")
            .eq("user_id", user.id)
            .in("review_id", reviewIds)
          : Promise.resolve({ data: null }),
        supabase
          .from("review_replies")
          .select("*")
          .in("review_id", reviewIds)
          .order("created_at", { ascending: true })
      ]);

      const userLikesData = userLikesResult.data;
      const repliesData = repliesResult.data;

      // Prepare states
      const likesMap: ReviewLikes = {};
      allReviews.forEach((r: any) => {
        likesMap[r.id] = {
          count: r.likes_count || 0,
          liked: userLikesData?.some((l: any) => l.review_id === r.id) || false,
        };
      });

      const repliesMap: ReviewReplies = {};
      reviewIds.forEach((id: string) => {
        repliesMap[id] = [];
      });
      if (repliesData) {
        repliesData.forEach((reply: ReviewReply) => {
          if (repliesMap[reply.review_id]) {
            repliesMap[reply.review_id].push(reply);
          }
        });
      }

      // Batch state updates
      setReviews(allReviews);
      if (user?.id) {
        const existing = allReviews.find((r: any) => r.user_id === user.id);
        if (existing) setUserReview(existing);
      }
      setLikes(likesMap);
      setReplies(repliesMap);
    })();
  }, [productId, user?.id]);

  const hasUserReview = !!userReview;

  const startEdit = useCallback(() => {
    if (!userReview) return;
    setText(userReview.review);
    setRating(userReview.rating);
    setIsEditing(true);
    setShowForm(true);
  }, [userReview]);

  const submit = async () => {
    if (!text.trim()) return;
    if (!user) {
      toast("Please sign in to write a review", {
        icon: "🔒",
        style: { borderRadius: "8px", background: "#141718", color: "#fff" },
      });
      return;
    }
    setSubmitting(true);
    const userName =
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "Anonymous";

    if (isEditing && userReview) {
      const { data, error } = await supabase
        .from("product_reviews")
        .update({ rating, review: text.trim() })
        .eq("id", userReview.id)
        .select()
        .maybeSingle();
      if (!error) {
        const updated = data || { ...userReview, rating, review: text.trim() };
        setReviews((prev) =>
          prev.map((r) => (r.id === userReview.id ? updated : r))
        );
        setUserReview(updated);
        setText("");
        setRating(5);
        setShowForm(false);
        setIsEditing(false);
        toast.success("Review updated!");
      } else {
        toast.error(error?.message || "Failed to update review");
      }
    } else {
      const { data, error } = await supabase
        .from("product_reviews")
        .insert({
          product_id: productId,
          user_id: user.id,
          user_name: userName,
          rating,
          review: text.trim(),
        })
        .select()
        .maybeSingle();
      if (!error) {
        const newReview = data || {
          id: crypto.randomUUID(),
          product_id: productId,
          user_id: user.id,
          user_name: userName,
          rating,
          review: text.trim(),
          created_at: new Date().toISOString(),
        };
        setReviews((prev) => [newReview, ...prev]);
        setUserReview(newReview);
        setText("");
        setRating(5);
        setShowForm(false);
        toast.success("Review submitted!");
      } else {
        toast.error(error?.message || "Failed to submit review");
      }
    }
    setSubmitting(false);
  };

  const toggleLike = async (reviewId: string) => {
    if (!user) {
      toast("Please sign in to like a review", {
        icon: "🔒",
        style: { borderRadius: "8px", background: "#141718", color: "#fff" },
      });
      return;
    }

    const current = likes[reviewId] || { count: 0, liked: false };
    console.log("Toggle like for review:", reviewId, "Current liked state:", current.liked, "User ID:", user.id);

    if (current.liked) {
      const { error } = await supabase
        .from("review_likes")
        .delete()
        .eq("review_id", reviewId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error unliking review:", error);
        toast.error("Failed to unlike review");
        return;
      }

      setLikes((prev) => ({
        ...prev,
        [reviewId]: { count: Math.max(0, current.count - 1), liked: false },
      }));

      // Optimistically update reviews list if needed or just rely on the likes state
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, likes_count: Math.max(0, (r.likes_count || 0) - 1) } : r));
    } else {
      const { error } = await supabase.from("review_likes").insert({
        review_id: reviewId,
        user_id: user.id,
      });

      if (error) {
        console.error("Error liking review:", error);
        toast.error("Failed to like review");
        return;
      }

      setLikes((prev) => ({
        ...prev,
        [reviewId]: { count: current.count + 1, liked: true },
      }));

      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, likes_count: (r.likes_count || 0) + 1 } : r));
    }
  };

  const submitReply = async (reviewId: string, replyText: string) => {
    if (!replyText.trim()) return;
    if (!user) {
      toast("Please sign in to reply", {
        icon: "🔒",
        style: { borderRadius: "8px", background: "#141718", color: "#fff" },
      });
      return;
    }

    const userName =
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "Anonymous";

    const { data, error } = await supabase
      .from("review_replies")
      .insert({
        review_id: reviewId,
        user_id: user.id,
        user_name: userName,
        reply: replyText.trim(),
      })
      .select()
      .single();

    if (!error && data) {
      setReplies((prev) => ({
        ...prev,
        [reviewId]: [...(prev[reviewId] || []), data],
      }));
      toast.success("Reply posted!");
    } else {
      toast.error(error?.message || "Failed to post reply");
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!user) return;
    if (!window.confirm("Are you sure you want to delete your review?")) return;

    const { error } = await supabase
      .from("product_reviews")
      .delete()
      .eq("id", reviewId)
      .eq("user_id", user.id);

    if (!error) {
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      if (userReview?.id === reviewId) {
        setUserReview(null);
        setText("");
        setRating(5);
        setIsEditing(false);
        setShowForm(false);
      }
      toast.success("Review deleted");
    } else {
      toast.error(error.message || "Failed to delete review");
    }
  };

  const sorted = [...reviews].sort((a, b) => {
    if (sortOption === "Highest Rating") return b.rating - a.rating;
    if (sortOption === "Lowest Rating") return a.rating - b.rating;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  return {
    reviews,
    sorted,
    avg,
    showForm,
    setShowForm,
    text,
    setText,
    rating,
    setRating,
    submitting,
    submit,
    sortOption,
    setSortOption,
    isEditing,
    setIsEditing,
    userReview,
    hasUserReview,
    startEdit,
    currentUserId: user?.id || null,
    likes,
    toggleLike,
    replies,
    submitReply,
    deleteReview,
  };
}

interface Props {
  productName: string;
  r: ReturnType<typeof useProductReviews>;
}

export default function ReviewsSection({ productName, r }: Props) {
  return (
    <div className="flex flex-col gap-6 mt-4">
      <div className="flex flex-col gap-4">
        <h3 className="text-[20px] md:text-[24px] font-medium font-poppins text-[#141718]">
          Customer Reviews
        </h3>
        <div className="flex items-center gap-2">
          <Stars count={r.avg} />
          <span className="text-[#141718] text-xs">
            {r.reviews.length} Reviews
          </span>
        </div>
        <div className="w-full flex justify-between items-center border border-[#E8ECEF] rounded-[80px] px-4 py-2 mt-2">
          <span className="text-[#6C7275] text-[14px]">{productName}</span>
          {r.hasUserReview ? (
            <button
              onClick={r.startEdit}
              className="bg-[#141718] text-white text-[14px] px-4 py-2 rounded-[80px] font-medium tracking-tight hover:bg-black transition-colors"
            >
              Edit Review
            </button>
          ) : (
            <button
              onClick={() => r.setShowForm(true)}
              className="bg-[#141718] text-white text-[14px] px-4 py-2 rounded-[80px] font-medium tracking-tight hover:bg-black transition-colors"
            >
              Write Review
            </button>
          )}
        </div>
      </div>

      {r.showForm && (
        <ReviewForm
          rating={r.rating}
          setRating={r.setRating}
          text={r.text}
          setText={r.setText}
          submitting={r.submitting}
          onSubmit={r.submit}
          onClose={() => {
            r.setShowForm(false);
            r.setIsEditing(false);
            r.setText("");
            r.setRating(5);
          }}
          isEditing={r.isEditing}
        />
      )}

      <div className="flex justify-between items-center border-b border-[#E8ECEF] pb-4 mt-2">
        <h4 className="text-[20px] font-medium font-poppins text-[#141718]">
          {r.reviews.length} Reviews
        </h4>
        <select
          value={r.sortOption}
          onChange={(e) => r.setSortOption(e.target.value)}
          className="border border-[#E8ECEF] bg-white rounded text-[#141718] text-[14px] px-3 py-2 outline-none"
        >
          <option>Newest</option>
          <option>Highest Rating</option>
          <option>Lowest Rating</option>
        </select>
      </div>

      {r.reviews.length === 0 ? (
        <p className="text-[#6C7275] text-[14px]">
          No reviews yet. Be the first to review!
        </p>
      ) : (
        <div className="flex flex-col gap-4 max-h-100 overflow-y-auto">
          {r.sorted.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              likes={r.likes[review.id] || { count: 0, liked: false }}
              onToggleLike={() => r.toggleLike(review.id)}
              replies={r.replies[review.id] || []}
              onSubmitReply={(text) => r.submitReply(review.id, text)}
              isOwner={r.currentUserId === review.user_id}
              onEdit={r.startEdit}
              onDelete={() => r.deleteReview(review.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
