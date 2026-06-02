"use client";

import { useState } from "react";

export const AdminMediaPicker = () => {
  const [filename, setFilename] = useState("");

  return (
    <label className="grid gap-2 text-sm font-medium">
      添加媒体
      <span className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-sky-200 bg-white/80 px-4 py-5 text-center transition-colors hover:border-sky-300 hover:bg-sky-50">
        <span className="rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700">
          选择照片或视频
        </span>
        <span className="mt-2 text-xs text-muted-foreground">
          {filename || "支持 JPG、PNG、WebP、GIF、MP4、WebM"}
        </span>
        <input
          name="media"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
          className="sr-only"
          onChange={(event) => {
            setFilename(event.currentTarget.files?.[0]?.name ?? "");
          }}
        />
      </span>
    </label>
  );
};
