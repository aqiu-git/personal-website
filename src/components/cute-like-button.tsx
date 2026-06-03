"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type CuteLikeButtonProps = {
  postId: string;
  className?: string;
};

const getInitialLikeCount = (id: string) => {
  const seed = id.split("").reduce((total, char) => total + char.charCodeAt(0), 0);

  return (seed % 18) + 3;
};

export const CuteLikeButton = ({ postId, className }: CuteLikeButtonProps) => {
  const [likeCount, setLikeCount] = useState(() => getInitialLikeCount(postId));

  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full border border-orange-100 bg-orange-50 px-3 text-xs font-medium text-orange-800 transition-colors hover:border-orange-200 hover:bg-orange-100",
        className
      )}
      onClick={() => setLikeCount((count) => count + 1)}
    >
      <span aria-hidden="true" className="text-sm">
        🐱
      </span>
      <span>喜欢 {likeCount}</span>
    </button>
  );
};
