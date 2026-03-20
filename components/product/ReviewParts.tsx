"use client";
import { useState } from "react";
import { IoMdStar, IoMdStarOutline } from "react-icons/io";
import { X, Edit2, Trash2 } from "lucide-react";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { BsReply } from "react-icons/bs";

export const Stars = ({
  count,
  size = "text-[14px]",
}: {
  count: number;
  size?: string;
}) => (
  <div className={`flex text-[#141718] ${size}`}>
    {[...Array(5)].map((_, i) =>
      i < Math.round(count) ? (
        <IoMdStar key={i} />
      ) : (
        <IoMdStarOutline key={i} />
      ),
    )}
  </div>
);

interface ReviewFormProps {
  rating: number;
  setRating: (v: number) => void;
  text: string;
  setText: (v: string) => void;
  submitting: boolean;
  onSubmit: () => void;
  onClose: () => void;
  isEditing?: boolean;
}

export function ReviewForm({
  rating,
  setRating,
  text,
  setText,
  submitting,
  onSubmit,
  onClose,
  isEditing = false,
}: ReviewFormProps) {
  return (
    <div className="border border-[#E8ECEF] rounded-lg p-5 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h4 className="text-[16px] font-medium text-[#141718]">
          {isEditing ? "Edit Your Review" : "Write a Review"}
        </h4>
        <button
          onClick={onClose}
          className="text-[#6C7275] hover:text-[#141718] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-[14px] text-[#6C7275]">Rating</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => setRating(s)}
              className="text-[24px] transition-colors"
            >
              {s <= rating ? (
                <IoMdStar className="text-[#141718]" />
              ) : (
                <IoMdStarOutline className="text-[#6C7275]" />
              )}
            </button>
          ))}
        </div>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Share your experience with this product..."
        rows={4}
        className="border border-[#E8ECEF] rounded-lg px-4 py-3 text-[14px] outline-none focus:border-[#141718] transition-colors resize-none"
      />
      <button
        onClick={onSubmit}
        disabled={submitting || !text.trim()}
        className="self-end bg-[#141718] text-white px-6 py-2.5 rounded-lg text-[14px] font-medium hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting
          ? isEditing
            ? "Updating..."
            : "Submitting..."
          : isEditing
            ? "Update Review"
            : "Submit Review"}
      </button>
    </div>
  );
}

interface ReviewReply {
  id: string;
  review_id: string;
  user_id: string;
  user_name: string;
  reply: string;
  created_at: string;
}

interface ReviewCardProps {
  review: any;
  likes: { count: number; liked: boolean };
  onToggleLike: () => void;
  replies: ReviewReply[];
  onSubmitReply: (text: string) => void;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function ReviewCard({
  review,
  likes,
  onToggleLike,
  replies,
  onSubmitReply,
  isOwner,
  onEdit,
  onDelete,
}: ReviewCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    await onSubmitReply(replyText);
    setReplyText("");
    setShowReplyForm(false);
    setSubmittingReply(false);
  };

  return (
    <div className="flex flex-col gap-4 border-b border-[#E8ECEF] pb-6">
      {/* Review Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#F3F5F7] flex items-center justify-center text-[16px] font-semibold text-[#141718]">
          {review.user_name?.charAt(0)?.toUpperCase() || "A"}
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[#141718] font-medium text-[16px]">
              {review.user_name}
            </span>
            {isOwner && (
              <span className="text-[10px] bg-[#F3F5F7] text-[#6C7275] px-2 py-0.5 rounded-full font-medium">
                You
              </span>
            )}
          </div>
          <Stars count={review.rating} size="text-[12px]" />
        </div>
        <span className="text-[#6C7275] text-[12px] ml-auto">
          {new Date(review.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* Review Body */}
      <p className="text-[#6C7275] text-[14px] leading-5.5">{review.review}</p>

      {/* Like & Reply Actions */}
      <div className="flex items-center gap-5">
        <button
          onClick={onToggleLike}
          className="flex items-center gap-1.5 text-[13px] text-[#6C7275] hover:text-[#141718] transition-colors group"
        >
          {likes.liked ? (
            <AiFillHeart className="text-[16px] text-red-500" />
          ) : (
            <AiOutlineHeart className="text-[16px] group-hover:text-red-400 transition-colors" />
          )}
          <span>
            {likes.count > 0 ? likes.count : ""}{" "}
            {likes.count === 1 ? "Like" : likes.count > 1 ? "Likes" : "Like"}
          </span>
        </button>

        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="flex items-center gap-1.5 text-[13px] text-[#6C7275] hover:text-[#141718] transition-colors"
        >
          <BsReply className="text-[16px]" />
          <span>Reply{replies.length > 0 ? ` (${replies.length})` : ""}</span>
        </button>

        {isOwner && (
          <div className="flex items-center gap-4 ml-auto">
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 text-[13px] text-[#6C7275] hover:text-[#141718] transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 text-[13px] text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Replies List */}
      {replies.length > 0 && (
        <div className="flex flex-col gap-3 ml-8 pl-4 border-l-2 border-[#E8ECEF]">
          {replies.map((r) => (
            <div key={r.id} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#F3F5F7] flex items-center justify-center text-[11px] font-semibold text-[#141718]">
                  {r.user_name?.charAt(0)?.toUpperCase() || "A"}
                </div>
                <span className="text-[#141718] font-medium text-[13px]">
                  {r.user_name}
                </span>
                <span className="text-[#6C7275] text-[11px]">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-[#6C7275] text-[13px] leading-5 ml-9">
                {r.reply}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Reply Form */}
      {showReplyForm && (
        <div className="flex gap-2 ml-8">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            className="flex-1 border border-[#E8ECEF] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#141718] transition-colors"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleReplySubmit();
              }
            }}
          />
          <button
            onClick={handleReplySubmit}
            disabled={submittingReply || !replyText.trim()}
            className="bg-[#141718] text-white px-4 py-2 rounded-lg text-[13px] font-medium hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {submittingReply ? "Posting..." : "Post"}
          </button>
        </div>
      )}
    </div>
  );
}
