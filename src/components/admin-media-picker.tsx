"use client";

import { useEffect, useState } from "react";

const maxMediaCount = 9;

type MediaPreview = {
  name: string;
  type: string;
  url: string;
};

type AdminMediaPickerProps = {
  resetKey: number;
};

export const AdminMediaPicker = ({ resetKey }: AdminMediaPickerProps) => {
  const [previews, setPreviews] = useState<MediaPreview[]>([]);
  const [message, setMessage] = useState("");

  useEffect(
    () => () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    },
    [previews]
  );

  useEffect(() => {
    setPreviews([]);
    setMessage("");
  }, [resetKey]);

  const imagePreviews = previews.filter((preview) => preview.type.startsWith("image/"));
  const videoCount = previews.filter((preview) => preview.type.startsWith("video/")).length;
  const visiblePreviews = imagePreviews.slice(0, 5);
  const names = previews.map((preview) => preview.name).join("、");

  return (
    <label className="grid gap-2 text-sm font-medium">
      添加媒体
      <span className="relative flex min-h-36 cursor-pointer overflow-hidden rounded-3xl border border-dashed border-sky-200 bg-white/85 px-4 py-5 transition-colors hover:border-sky-300 hover:bg-sky-50">
        <span className="flex min-w-0 flex-1 flex-col justify-center text-center">
          <span className="mx-auto rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700">
            选择照片或视频
          </span>
          <span className="mt-2 line-clamp-2 text-xs text-muted-foreground">
            {names || "支持 JPG、PNG、WebP、GIF、MP4、WebM，最多 9 个"}
          </span>
          {message ? <span className="mt-2 text-xs text-orange-600">{message}</span> : null}
          {videoCount > 0 ? (
            <span className="mt-2 text-xs text-sky-600">已选择 {videoCount} 个视频。</span>
          ) : null}
        </span>
        {imagePreviews.length > 0 ? (
          <span className="relative ml-4 hidden h-24 w-32 shrink-0 sm:block">
            {visiblePreviews.map((preview, index) => (
              <span
                key={preview.url}
                role="img"
                aria-label={preview.name}
                className="absolute h-20 w-24 rounded-2xl border border-white bg-cover bg-center shadow-md shadow-sky-100"
                style={{
                  backgroundImage: `url(${preview.url})`,
                  right: `${index * 14}px`,
                  top: `${index * 6}px`,
                  zIndex: visiblePreviews.length - index
                }}
              />
            ))}
            {imagePreviews.length > visiblePreviews.length ? (
              <span className="absolute bottom-0 right-0 z-10 rounded-full bg-sky-500 px-2 py-0.5 text-xs font-semibold text-white shadow-sm">
                +{imagePreviews.length - visiblePreviews.length}
              </span>
            ) : null}
          </span>
        ) : null}
        <input
          name="media"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
          multiple
          className="sr-only"
          onChange={(event) => {
            const selectedFiles = Array.from(event.currentTarget.files ?? []);
            const files = selectedFiles.slice(0, maxMediaCount);

            if (selectedFiles.length > maxMediaCount) {
              const dataTransfer = new DataTransfer();
              files.forEach((file) => dataTransfer.items.add(file));
              event.currentTarget.files = dataTransfer.files;
              setMessage(`最多只能选择 ${maxMediaCount} 张，已保留前 ${maxMediaCount} 张。`);
            } else {
              setMessage("");
            }

            setPreviews(
              files.map((file) => ({
                name: file.name,
                type: file.type,
                url: URL.createObjectURL(file)
              }))
            );
          }}
        />
      </span>
    </label>
  );
};
