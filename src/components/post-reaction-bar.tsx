"use client";

import { useState } from "react";

type PostReactionBarProps = {
  postId: string;
};

const getInitialLikeCount = (id: string) => {
  const seed = id.split("").reduce((total, char) => total + char.charCodeAt(0), 0);

  return (seed % 18) + 3;
};

const getInitialDislikeCount = (id: string) => {
  const seed = id.split("").reduce((total, char) => total + char.charCodeAt(0), 0);

  return seed % 4;
};

export const PostReactionBar = ({ postId }: PostReactionBarProps) => {
  const [likeCount, setLikeCount] = useState(() => getInitialLikeCount(postId));
  const [dislikeCount, setDislikeCount] = useState(() => getInitialDislikeCount(postId));
  const buttonClass =
    "inline-flex h-9 items-center gap-1.5 rounded-full border border-orange-100 bg-orange-50 px-3 text-xs font-medium text-orange-800 transition-colors hover:border-orange-200 hover:bg-orange-100";

  return (
    <div className="flex flex-wrap gap-2 border-t border-orange-100 pt-4">
      <button
        type="button"
        aria-label={`喜欢 ${likeCount}`}
        className={buttonClass}
        onClick={() => setLikeCount((count) => count + 1)}
      >
        <span aria-hidden="true" className="text-sm">
          🐱
        </span>
        <span>喜欢 {likeCount}</span>
      </button>
      <button
        type="button"
        aria-label={`差评 ${dislikeCount}`}
        className={buttonClass}
        onClick={() => setDislikeCount((count) => count + 1)}
      >
        <span aria-hidden="true" className="text-sm">
          😿
        </span>
        <span>差评 {dislikeCount}</span>
      </button>
    </div>
  );
};
