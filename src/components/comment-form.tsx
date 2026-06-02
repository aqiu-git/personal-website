"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type CommentFormProps = {
  postId: string;
};

export const CommentForm = ({ postId }: CommentFormProps) => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <form
      className="space-y-3"
      onSubmit={async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setMessage("");

        const formData = new FormData(event.currentTarget);
        const response = await fetch("/api/comments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            postId,
            nickname: formData.get("nickname"),
            email: formData.get("email"),
            content: formData.get("content")
          })
        });

        setIsSubmitting(false);
        setMessage(response.ok ? "评论发布成功。" : "提交失败，请稍后再试。");

        if (response.ok) {
          event.currentTarget.reset();
        }
      }}
    >
      <div className="grid gap-3 md:grid-cols-2">
        <Input name="nickname" placeholder="昵称" required maxLength={40} />
        <Input name="email" placeholder="邮箱" type="email" required />
      </div>
      <Textarea name="content" placeholder="写下你的评论" required maxLength={1000} />
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "提交中..." : "提交评论"}
        </Button>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </div>
    </form>
  );
};
