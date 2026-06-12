"use client";

import Image from "next/image";
import Link from "next/link";
import type { FormEvent, PointerEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { CuteLikeButton } from "@/components/cute-like-button";
import { PostImageGrid, type PostGridImage } from "@/components/post-image-grid";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getDownloadHref } from "@/lib/download";
import { isLocalUploadUrl } from "@/lib/media";
import { cn, formatDate } from "@/lib/utils";

export type CategoryTimelinePost = {
  id: string;
  title: string;
  slug: string;
  description: string;
  summary: string | null;
  type: string;
  coverImage: string | null;
  media: PostGridImage[];
  publishedAt: string | null;
  createdAt: string;
  categoryName: string;
  parentCategoryName: string | null;
  commentCount: number;
  comments: Array<{
    id: string;
    nickname: string;
    content: string;
    highlighted: boolean;
    createdAt: string;
  }>;
};

type CategoryTimelineProps = {
  posts: CategoryTimelinePost[];
};

export const CategoryTimeline = ({ posts }: CategoryTimelineProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  const markerTop = posts.length > 1 ? (activeIndex / (posts.length - 1)) * 96 + 2 : 8;

  useEffect(() => {
    if (posts.length === 0) {
      return undefined;
    }

    let frameId: number | null = null;

    const updateActiveIndex = () => {
      const viewportCenter = window.innerHeight / 2;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      itemRefs.current.forEach((node, index) => {
        if (!node) {
          return;
        }

        const rect = node.getBoundingClientRect();
        const itemCenter = rect.top + rect.height / 2;
        const distance = Math.abs(itemCenter - viewportCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveIndex(closestIndex);
      frameId = null;
    };

    const scheduleUpdate = () => {
      if (frameId !== null) {
        return;
      }

      frameId = window.requestAnimationFrame(updateActiveIndex);
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [posts.length]);

  if (posts.length === 0) {
    return (
      <section className="rounded-3xl border border-orange-100 bg-orange-50/70 p-8 text-sm text-muted-foreground">
        这个分类还没有公开内容。
      </section>
    );
  }

  return (
    <section className="grid gap-10 lg:grid-cols-[minmax(0,760px)_minmax(260px,1fr)]">
      <div className="space-y-10 py-4 md:space-y-16">
        {posts.map((post, index) => (
          <article
            key={post.id}
            ref={(node) => {
              itemRefs.current[index] = node;
            }}
            className="scroll-mt-28"
          >
            <TimelineCard post={post} priority={index === 0} />
          </article>
        ))}
      </div>

      <aside className="hidden lg:block">
        <div className="sticky top-24 h-[calc(100vh-8rem)] min-h-[560px]">
          <p className="text-sm font-semibold text-orange-700">类目时间轴</p>
          <p className="mt-1 max-w-48 text-xs leading-5 text-muted-foreground">
            缩图和日期沿轴分布，同一天的内容会叠成一组卡片。
          </p>
          <MiniTimelineRail
            posts={posts}
            activeIndex={activeIndex}
            markerTop={markerTop}
            onSelect={(index) => {
              setActiveIndex(index);
              itemRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          />
        </div>
      </aside>

      <div className="relative border-l border-orange-100 pl-5 lg:hidden">
        {posts.map((post, index) => (
          <button
            key={post.id}
            type="button"
            className={cn(
              "mb-3 flex items-center gap-3 text-left text-xs text-muted-foreground transition-colors",
              activeIndex === index && "text-orange-700"
            )}
            onClick={() => {
              setActiveIndex(index);
              itemRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          >
            <span className="h-2 w-2 rounded-full bg-orange-200" />
            <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
            {post.coverImage ? (
              <Image
                src={post.coverImage}
                alt={post.title}
                width={44}
                height={34}
                className="h-8 w-11 rounded-md border border-orange-100 object-cover"
                unoptimized={isLocalUploadUrl(post.coverImage)}
              />
            ) : null}
          </button>
        ))}
      </div>
    </section>
  );
};

const TimelineCard = ({
  post,
  priority
}: {
  post: CategoryTimelinePost;
  priority: boolean;
}) => {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentMessage, setCommentMessage] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [dislikeCount, setDislikeCount] = useState(() => getInitialDislikeCount(post.id));
  const isPet = post.parentCategoryName === "猫咪萌照" || post.categoryName.includes("猫");
  const downloadHref = getDownloadHref(post.coverImage, post.slug);
  const gridImages =
    post.media.length > 0
      ? post.media
      : post.coverImage
        ? [{ id: post.id, url: post.coverImage, alt: post.title }]
        : [];

  return (
    <div
      className={cn(
        "overflow-hidden rounded-3xl border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:-translate-y-0.5",
        isPet
          ? "border-rose-100 shadow-rose-100/60"
          : "border-orange-100 shadow-orange-100/70"
      )}
    >
      <PostImageGrid
        images={gridImages}
        href={`/posts/${post.slug}`}
        priority={priority}
        previewOnMultiImage
      />
      <div className="space-y-4 p-5">
        <div className="flex flex-wrap gap-2">
          <Badge className="border-orange-100 bg-orange-50 text-orange-700">
            {post.parentCategoryName ?? post.categoryName}
          </Badge>
          <Badge className="border-rose-100 bg-rose-50 text-rose-700">{post.type}</Badge>
        </div>
        <Link href={`/posts/${post.slug}`} className="block hover:text-orange-700">
          <h2 className="text-xl font-semibold tracking-normal">{post.title}</h2>
        </Link>
        <p className="text-sm leading-6 text-muted-foreground">{post.summary ?? post.description}</p>
        <div className="flex flex-wrap gap-2 border-t border-orange-100 pt-4 text-xs">
          <CuteActionButton
            icon="💬"
            label={`评论 ${post.commentCount}`}
            pressed={isCommentsOpen}
            onClick={() => setIsCommentsOpen((value) => !value)}
          />
          <CuteDownloadLink href={downloadHref} />
          <CuteLikeButton postId={post.id} />
          <CuteActionButton
            icon={isPet ? "😿" : "×"}
            label={`差评 ${dislikeCount}`}
            onClick={() => setDislikeCount((count) => count + 1)}
          />
        </div>
        {isCommentsOpen ? (
          <InlineComments
            post={post}
            isSubmitting={isSubmittingComment}
            message={commentMessage}
            onSubmit={async (event) => {
              event.preventDefault();
              setCommentMessage("");
              setIsSubmittingComment(true);

              const formData = new FormData(event.currentTarget);
              const response = await fetch("/api/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  postId: post.id,
                  nickname: formData.get("nickname"),
                  email: "visitor@example.com",
                  content: formData.get("content")
                })
              });

              setIsSubmittingComment(false);
              setCommentMessage(response.ok ? "评论发布成功。" : "提交失败，稍后再试一次。");

              if (response.ok) {
                event.currentTarget.reset();
              }
            }}
          />
        ) : null}
      </div>
    </div>
  );
};

const getInitialDislikeCount = (id: string) => {
  const seed = id.split("").reduce((total, char) => total + char.charCodeAt(0), 0);

  return seed % 4;
};

const CuteActionButton = ({
  icon,
  label,
  pressed,
  onClick
}: {
  icon: string;
  label: string;
  pressed?: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    aria-pressed={pressed}
    className={cn(
      "inline-flex h-9 items-center gap-1.5 rounded-full border border-orange-100 bg-orange-50 px-3 text-xs font-medium text-orange-800 transition-colors hover:border-orange-200 hover:bg-orange-100",
      pressed && "border-orange-300 bg-orange-300 text-white"
    )}
    onClick={onClick}
  >
    <span aria-hidden="true" className="text-sm">
      {icon}
    </span>
    <span>{label}</span>
  </button>
);

const CuteDownloadLink = ({ href }: { href: string | undefined }) => (
  <a
    href={href}
    aria-disabled={!href}
    className={cn(
      "inline-flex h-9 items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 text-xs font-medium text-emerald-800 transition-colors hover:border-emerald-200 hover:bg-emerald-100",
      !href && "pointer-events-none opacity-50"
    )}
  >
    <span aria-hidden="true" className="text-sm">
      ↓
    </span>
    <span>下载</span>
  </a>
);

const InlineComments = ({
  post,
  isSubmitting,
  message,
  onSubmit
}: {
  post: CategoryTimelinePost;
  isSubmitting: boolean;
  message: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}) => (
  <div className="rounded-3xl border border-orange-100 bg-orange-50/70 p-4 shadow-inner shadow-orange-100/60">
    <div className="mb-3 flex items-center gap-3">
      <p className="text-sm font-medium text-orange-950">评论 {post.commentCount}</p>
    </div>
    <form className="mb-4 grid gap-3 rounded-3xl bg-background/80 p-3" onSubmit={onSubmit}>
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
    {post.comments.length > 0 ? (
      <div className="space-y-3">
        {post.comments.map((comment) => (
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
  </div>
);

const getPostDayKey = (post: CategoryTimelinePost) => {
  const date = new Date(post.publishedAt ?? post.createdAt);

  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

const getTimelineGroups = (posts: CategoryTimelinePost[]) => {
  const groups: Array<{
    date: string;
    index: number;
    items: Array<{ index: number; post: CategoryTimelinePost }>;
  }> = [];

  posts.forEach((post, index) => {
    const key = getPostDayKey(post);
    const group = groups.find((item) => item.date === key);

    if (group) {
      group.items.push({ index, post });
      return;
    }

    groups.push({
      date: key,
      index,
      items: [{ index, post }]
    });
  });

  return groups;
};

const MiniTimelineRail = ({
  posts,
  activeIndex,
  markerTop,
  onSelect
}: {
  posts: CategoryTimelinePost[];
  activeIndex: number;
  markerTop: number;
  onSelect: (index: number) => void;
}) => {
  const railRef = useRef<HTMLDivElement | null>(null);
  const groups = getTimelineGroups(posts);

  const selectByPointer = (clientY: number) => {
    const rail = railRef.current;

    if (!rail || posts.length === 0) {
      return;
    }

    const rect = rail.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
    const index = Math.round(ratio * (posts.length - 1));
    onSelect(index);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    selectByPointer(event.clientY);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.buttons !== 1) {
      return;
    }

    selectByPointer(event.clientY);
  };

  return (
    <div
      ref={railRef}
      className="relative mt-6 h-[calc(100%-5.5rem)] min-h-[460px] cursor-grab touch-none active:cursor-grabbing"
      role="slider"
      aria-label="拖动时间轴"
      aria-valuemin={1}
      aria-valuemax={posts.length}
      aria-valuenow={activeIndex + 1}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
    >
      <div className="absolute bottom-0 left-[58%] top-0 w-px bg-orange-200" />
      <button
        type="button"
        className="absolute left-[58%] z-20 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-transparent drop-shadow-sm transition-all duration-200 hover:scale-110"
        style={{ top: `${markerTop}%` }}
        aria-label="当前时间轴位置"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 64 64"
          className="h-11 w-11 -translate-y-2.5 rotate-[-12deg] text-orange-300 drop-shadow-sm"
        >
          <ellipse
            cx="18"
            cy="24"
            rx="6.3"
            ry="8.4"
            fill="currentColor"
            stroke="#fff7ed"
            strokeWidth="2.5"
            transform="rotate(-24 18 24)"
          />
          <ellipse
            cx="29"
            cy="16"
            rx="6.5"
            ry="8.8"
            fill="currentColor"
            stroke="#fff7ed"
            strokeWidth="2.5"
            transform="rotate(-8 29 16)"
          />
          <ellipse
            cx="41"
            cy="17"
            rx="6.5"
            ry="8.8"
            fill="currentColor"
            stroke="#fff7ed"
            strokeWidth="2.5"
            transform="rotate(12 41 17)"
          />
          <ellipse
            cx="50"
            cy="27"
            rx="6.1"
            ry="8.1"
            fill="currentColor"
            stroke="#fff7ed"
            strokeWidth="2.5"
            transform="rotate(30 50 27)"
          />
          <path
            d="M32 33.5c-8.8 0-16 6.6-16 14.4 0 6.9 5.7 10.1 16 10.1s16-3.2 16-10.1c0-7.8-7.2-14.4-16-14.4Z"
            fill="currentColor"
            stroke="#fff7ed"
            strokeLinejoin="round"
            strokeWidth="2.5"
          />
        </svg>
      </button>
      {groups.map((group, groupIndex) => {
        const top = posts.length > 1 ? (group.index / (posts.length - 1)) * 96 + 2 : 8;
        const isRight = groupIndex % 2 === 0;
        const activeInGroup = group.items.some((item) => item.index === activeIndex);
        const previewItems = group.items.slice(0, 3);

        return (
          <button
            key={group.date}
            type="button"
            className={cn(
              "absolute grid w-[132px] gap-1 text-left text-xs text-muted-foreground transition-colors hover:text-orange-700",
              isRight ? "left-[calc(58%+24px)]" : "right-[calc(42%+24px)] text-right",
              activeInGroup && "text-orange-700"
            )}
            style={{ top: `${top}%`, transform: "translateY(-50%)" }}
            onClick={(event) => {
              event.stopPropagation();
              onSelect(group.index);
            }}
          >
            <span
              className={cn(
                "absolute top-1/2 h-px w-5 bg-orange-200",
                isRight ? "-left-6" : "-right-6"
              )}
            />
            <span
              className={cn(
                "absolute top-1/2 flex h-3 w-3 -translate-y-1/2 items-center justify-center rounded-full border border-background bg-orange-100 ring-1 ring-orange-200",
                isRight ? "-left-[34px]" : "-right-[34px]",
                activeInGroup && "bg-orange-300 ring-orange-400"
              )}
            />
            <span className="font-medium">
              {formatDate(group.items[0].post.publishedAt ?? group.items[0].post.createdAt)}
            </span>
            <span className={cn("relative mt-1 h-[76px] w-[108px]", isRight ? "" : "ml-auto")}>
              {previewItems.map((item, stackIndex) => {
                const offset = stackIndex * 7;

                return item.post.coverImage ? (
                  <Image
                    key={item.post.id}
                    src={item.post.coverImage}
                    alt={item.post.title}
                    width={108}
                    height={76}
                    className="absolute h-16 w-24 rounded-xl border border-orange-100 object-cover shadow-sm shadow-orange-100/70"
                    unoptimized={isLocalUploadUrl(item.post.coverImage)}
                    style={{
                      left: `${isRight ? offset : -offset}px`,
                      top: `${offset}px`,
                      zIndex: previewItems.length - stackIndex
                    }}
                  />
                ) : (
                  <span
                    key={item.post.id}
                    className="absolute flex h-16 w-24 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-[10px]"
                    style={{
                      left: `${isRight ? offset : -offset}px`,
                      top: `${offset}px`,
                      zIndex: previewItems.length - stackIndex
                    }}
                  >
                    无缩图
                  </span>
                );
              })}
              {group.items.length > 1 ? (
                <span
                  className={cn(
                    "absolute top-1 rounded-full bg-orange-400 px-1.5 py-0.5 text-[10px] font-semibold text-white",
                    isRight ? "right-1" : "left-1"
                  )}
                >
                  {group.items.length}
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
};
