"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const MediaUploadForm = () => {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <form
      className="grid gap-3 rounded-lg border border-border p-4 md:grid-cols-[1fr_1fr_auto]"
      onSubmit={async (event) => {
        event.preventDefault();
        setMessage("");
        setIsSubmitting(true);

        const formData = new FormData(event.currentTarget);
        const response = await fetch("/api/media", {
          method: "POST",
          body: formData
        });

        setIsSubmitting(false);
        setMessage(response.ok ? "上传成功" : "上传失败");

        if (response.ok) {
          event.currentTarget.reset();
          router.refresh();
        }
      }}
    >
      <Input
        name="file"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
        required
      />
      <Input name="alt" placeholder="替代文本" />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "上传中..." : "上传"}
      </Button>
      {message ? <p className="text-sm text-muted-foreground md:col-span-3">{message}</p> : null}
    </form>
  );
};
