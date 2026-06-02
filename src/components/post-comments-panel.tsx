"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatDate } from "@/lib/utils";

type PostComment = {
  id: string;
  nickname: string;
  content: string;
  highlighted: boolean;
  createdAt: Date | string;
};

type PostCommentsPanelProps = {
  postId: string;
  comments: PostComment[];
  commentCount?: number;
  id?: string;
};

export const PostCommentsPanel = ({
  postId,
  comments,
  commentCount = comments.length,
  id
}: PostCommentsPanelProps) => {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const response = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postId,
        nickname: formData.get("nickname"),
        email: "visitor@example.com",
        content: formData.get("content")
      })
    });

    setIsSubmitting(false);
    setMessage(response.ok ? "评论发布成功。" : "提交失败，稍后再试一次。");

    if (response.ok) {
      form.reset();
      router.refresh();
    }
  };

  return (
    <section
      id={id}
      className="rounded-3xl border border-orange-100 bg-orange-50/70 p-4 shadow-inner shadow-orange-100/60"
    >
      <div className="mb-3 flex items-center gap-3">
        <p className="text-sm font-medium text-orange-950">评论 {commentCount}</p>
      </div>
      <form className="mb-4 grid gap-3 rounded-3xl bg-background/80 p-3" onSubmit={handleSubmit}>
        <Input
          name="nickname"
          placeholder="昵称"
          required
          maxLength={40}
          className="h-11 rounded-full border-orange-100 bg-white/90 px-5 text-base placeholder:text-orange-300 focus-visible:ring-orange-200"
        />
        <Textarea
          name="content"
          placeholder="评价"
          required
          maxLength={1000}
          className="min-h-16 rounded-[28px] border-orange-100 bg-white/90 px-5 py-4 text-base placeholder:text-orange-300 focus-visible:ring-orange-200"
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-10 items-center rounded-full bg-orange-400 px-5 text-xs font-medium text-white transition-colors hover:bg-orange-500 disabled:opacity-60"
          >
            {isSubmitting ? "发送中..." : "发送评论"}
          </button>
          {message ? <p className="text-xs text-orange-800">{message}</p> : null}
        </div>
      </form>
      {comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={cn(
                "rounded-2xl bg-background/80 p-3",
                comment.highlighted && "border border-amber-200 bg-amber-50/90 shadow-sm shadow-amber-100"
              )}
            >
              <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-2">
                  <span>{comment.nickname}</span>
                  {comment.highlighted ? (
                    <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[11px] font-medium text-amber-900">
                      站长点亮
                    </span>
                  ) : null}
                </span>
                <span>{formatDate(comment.createdAt)}</span>
              </div>
              <p className="mt-2 text-sm leading-6">{comment.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm leading-6 text-muted-foreground">还没有评论，坐第一个小板凳吧。</p>
      )}
    </section>
  );
};
