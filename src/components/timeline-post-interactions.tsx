"use client";

import { useState } from "react";
import { CuteLikeButton } from "@/components/cute-like-button";
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

export const TimelinePostInteractions = ({
  postId,
  commentCount,
  comments
}: TimelinePostInteractionsProps) => {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

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
        <CuteLikeButton postId={postId} />
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
