"use client";

import { PostStatus, PostType, type Category } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AdminMediaPicker } from "@/components/admin-media-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type AdminPostFormProps = {
  categories: Category[];
};

type MediaPayload = {
  media: {
    id: string;
    type: "IMAGE" | "VIDEO";
    url: string;
  };
};

const isMediaPayload = (value: unknown): value is MediaPayload => {
  if (!value || typeof value !== "object" || !("media" in value)) {
    return false;
  }

  const media = value.media;

  return (
    !!media &&
    typeof media === "object" &&
    "id" in media &&
    "url" in media &&
    "type" in media &&
    typeof media.id === "string" &&
    typeof media.url === "string" &&
    (media.type === "IMAGE" || media.type === "VIDEO")
  );
};

const makeSlug = (value: string) => {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || `post-${Date.now()}`;
};

const selectClass =
  "flex h-11 w-full rounded-2xl border border-sky-100 bg-white/90 px-4 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sky-200";
const inputClass = "rounded-2xl border-sky-100 bg-white/90 focus-visible:ring-sky-200";

export const AdminPostForm = ({ categories }: AdminPostFormProps) => {
  const router = useRouter();
  const parentCategories = useMemo(
    () => categories.filter((category) => category.parentId === null),
    [categories]
  );
  const defaultParentId = parentCategories[0]?.id ?? "";
  const [parentId, setParentId] = useState(defaultParentId);
  const [categoryId, setCategoryId] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaResetKey, setMediaResetKey] = useState(0);
  const childCategories = useMemo(
    () => categories.filter((category) => category.parentId === parentId),
    [categories, parentId]
  );
  const availableCategories = childCategories.length > 0 ? childCategories : parentCategories;

  useEffect(() => {
    setCategoryId(availableCategories[0]?.id ?? "");
  }, [availableCategories]);

  return (
    <section
      id="publish"
      className="scroll-mt-24 rounded-3xl border border-sky-100 bg-sky-50/70 p-5 shadow-sm shadow-sky-100/60"
    >
      <div className="mb-5 space-y-1">
        <p className="text-sm font-medium text-sky-500">Publish</p>
        <h2 className="text-2xl font-semibold tracking-normal">发表内容</h2>
        <p className="text-sm text-muted-foreground">
          选好类目，添加可选媒体，再写一点内容。图片和视频共用一个入口。
        </p>
      </div>
      <form
        className="grid gap-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setMessage("");
          setIsSubmitting(true);

          const form = event.currentTarget;
          const formData = new FormData(form);
          const title = formData.get("title")?.toString().trim() ?? "";
          const status = formData.get("status")?.toString() as PostStatus;
          let coverImage: string | undefined;
          let mediaIds: string[] | undefined;
          let postType: PostType = PostType.TEXT;
          const files = formData
            .getAll("media")
            .filter((file): file is File => file instanceof File && file.size > 0);

          if (files.length > 9) {
            setIsSubmitting(false);
            setMessage("最多只能发布 9 张图片。");
            return;
          }

          if (files.length > 0) {
            const uploadedMedia: MediaPayload["media"][] = [];

            for (const file of files) {
              const mediaForm = new FormData();
              mediaForm.set("file", file);
              mediaForm.set("alt", title);
              const uploadResponse = await fetch("/api/media", {
                method: "POST",
                body: mediaForm
              });
              const payload: unknown = await uploadResponse.json();

              if (!uploadResponse.ok || !isMediaPayload(payload)) {
                setIsSubmitting(false);
                setMessage("媒体上传失败，请换一个文件再试。");
                return;
              }

              uploadedMedia.push(payload.media);
            }

            const firstImage = uploadedMedia.find((media) => media.type === "IMAGE");
            const firstMedia = uploadedMedia[0];

            coverImage = firstImage?.url;
            mediaIds = uploadedMedia.map((media) => media.id);
            postType =
              uploadedMedia.length > 1
                ? PostType.GALLERY
                : firstMedia?.type === "VIDEO"
                  ? PostType.VIDEO
                  : PostType.IMAGE;
          }

          const content = formData.get("content")?.toString().trim() ?? "";
          const response = await fetch("/api/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title,
              slug: makeSlug(formData.get("slug")?.toString() || title),
              description: formData.get("description")?.toString().trim(),
              summary: formData.get("summary")?.toString().trim() || undefined,
              content: coverImage && !content ? `![${title}](${coverImage})` : content,
              type: postType,
              status,
              coverImage,
              mediaIds,
              categoryId,
              publishedAt: status === PostStatus.PUBLISHED ? new Date().toISOString() : undefined
            })
          });

          setIsSubmitting(false);

          if (!response.ok) {
            setMessage("发布失败，请检查标题、类目和正文。");
            return;
          }

          form.reset();
          setMediaResetKey((value) => value + 1);
          setMessage("发布成功，前台已经能看到了。");
          router.refresh();
        }}
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Input name="title" placeholder="标题" required className={inputClass} />
          <Input name="slug" placeholder="英文 slug，可留空自动生成" className={inputClass} />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            一级类目
            <select
              value={parentId}
              className={selectClass}
              onChange={(event) => setParentId(event.target.value)}
            >
              {parentCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium">
            二级类目
            <select
              name="categoryId"
              value={categoryId}
              className={selectClass}
              required
              onChange={(event) => setCategoryId(event.target.value)}
            >
              {availableCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <Input name="description" placeholder="一句话描述" required className={inputClass} />
        <Input name="summary" placeholder="摘要，可选" className={inputClass} />
        <div className="grid gap-3 md:grid-cols-2">
          <AdminMediaPicker resetKey={mediaResetKey} />
          <label className="grid gap-2 text-sm font-medium">
            发布状态
            <select name="status" defaultValue={PostStatus.PUBLISHED} className={selectClass}>
              <option value={PostStatus.PUBLISHED}>立即发布</option>
              <option value={PostStatus.DRAFT}>存为草稿</option>
            </select>
          </label>
        </div>
        <Textarea
          name="content"
          placeholder="正文内容或媒体说明"
          required
          className="min-h-36 rounded-3xl border-sky-100 bg-white/90 focus-visible:ring-sky-200"
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            disabled={isSubmitting || !categoryId}
            className="rounded-full bg-blue-500 px-6 hover:bg-blue-600"
          >
            {isSubmitting ? "发布中..." : "发布内容"}
          </Button>
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        </div>
      </form>
    </section>
  );
};
