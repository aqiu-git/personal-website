"use client";

import { useState } from "react";
import { PostCommentsPanel } from "@/components/post-comments-panel";
import { cn } from "@/lib/utils";

type TimelinePostComment = {
  id: string;
  nickname: string;
  content: string;
  highlighted: boolean;
  createdAt: Date | string;
};

type TimelinePostInteractionsProps = {
  postId: string;
  commentCount: number;
  comments: TimelinePostComment[];
};

const getInitialLikeCount = (id: string) => {
  const seed = id.split("").reduce((total, char) => total + char.charCodeAt(0), 0);

  return (seed % 18) + 3;
};

export const TimelinePostInteractions = ({
  postId,
  commentCount,
  comments
}: TimelinePostInteractionsProps) => {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(() => getInitialLikeCount(postId));

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={isCommentsOpen}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-full border border-orange-100 bg-orange-50 px-3 text-xs font-medium text-orange-800 transition-colors hover:border-orange-200 hover:bg-orange-100",
            isCommentsOpen && "border-orange-300 bg-orange-300 text-white"
          )}
          onClick={() => setIsCommentsOpen((value) => !value)}
        >
          <span aria-hidden="true">💬</span>
          <span>评论 {commentCount}</span>
        </button>
        <button
          type="button"
          aria-pressed={liked}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-full border border-rose-100 bg-rose-50 px-3 text-xs font-medium text-rose-800 transition-colors hover:border-rose-200 hover:bg-rose-100",
            liked && "border-rose-300 bg-rose-300 text-white"
          )}
          onClick={() => {
            setLiked((current) => {
              setLikeCount((count) => (current ? Math.max(0, count - 1) : count + 1));
              return !current;
            });
          }}
        >
          <span aria-hidden="true">♡</span>
          <span>{liked ? "已喜欢" : "喜欢"} {likeCount}</span>
        </button>
      </div>
      {isCommentsOpen ? (
        <PostCommentsPanel
          postId={postId}
          comments={comments}
          commentCount={commentCount}
        />
      ) : null}
    </div>
  );
};
