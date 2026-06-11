"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { isLocalUploadUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

export type PostGridImage = {
  id: string;
  url: string;
  alt: string;
};

type PostImageGridProps = {
  images: PostGridImage[];
  href?: string;
  priority?: boolean;
  className?: string;
};

export const PostImageGrid = ({ images, href, priority = false, className }: PostImageGridProps) => {
  const visibleImages = images.slice(0, 9);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeImage = activeIndex === null ? null : visibleImages[activeIndex] ?? null;

  useEffect(() => {
    if (activeIndex === null) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveIndex(null);
        return;
      }

      if (event.key === "ArrowLeft") {
        setActiveIndex((index) =>
          index === null ? index : (index - 1 + visibleImages.length) % visibleImages.length
        );
        return;
      }

      if (event.key === "ArrowRight") {
        setActiveIndex((index) =>
          index === null ? index : (index + 1) % visibleImages.length
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, visibleImages.length]);

  if (visibleImages.length === 0) {
    return null;
  }

  const lightbox = activeImage ? (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      onClick={() => setActiveIndex(null)}
    >
      <button
        type="button"
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-lg font-semibold text-white transition-colors hover:bg-white/25"
        aria-label="Close image preview"
        onClick={() => setActiveIndex(null)}
      >
        x
      </button>
      {visibleImages.length > 1 ? (
        <>
          <button
            type="button"
            className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-2xl font-semibold text-white transition-colors hover:bg-white/25"
            aria-label="Previous image"
            onClick={(event) => {
              event.stopPropagation();
              setActiveIndex((index) =>
                index === null ? index : (index - 1 + visibleImages.length) % visibleImages.length
              );
            }}
          >
            &lt;
          </button>
          <button
            type="button"
            className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-2xl font-semibold text-white transition-colors hover:bg-white/25"
            aria-label="Next image"
            onClick={(event) => {
              event.stopPropagation();
              setActiveIndex((index) =>
                index === null ? index : (index + 1) % visibleImages.length
              );
            }}
          >
            &gt;
          </button>
        </>
      ) : null}
      <Image
        src={activeImage.url}
        alt={activeImage.alt}
        width={1600}
        height={1200}
        className="max-h-[88vh] w-auto max-w-full rounded-lg object-contain"
        unoptimized={isLocalUploadUrl(activeImage.url)}
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  ) : null;

  if (visibleImages.length === 1) {
    const image = visibleImages[0];
    const isLocalUpload = isLocalUploadUrl(image.url);
    const content = (
      <Image
        src={image.url}
        alt={image.alt}
        width={900}
        height={620}
        className="aspect-[5/4] w-full rounded-lg object-cover transition-transform duration-500 group-hover:scale-[1.025] sm:aspect-[4/3] md:rounded-2xl"
        priority={priority}
        unoptimized={isLocalUpload}
      />
    );

    return href ? (
      <Link href={href} className={cn("group block overflow-hidden rounded-lg md:rounded-2xl", className)}>
        {content}
      </Link>
    ) : (
      <>
        <button
          type="button"
          className={cn(
            "group block w-full cursor-zoom-in overflow-hidden rounded-lg text-left md:rounded-2xl",
            className
          )}
          onClick={() => setActiveIndex(0)}
        >
          {content}
        </button>
        {lightbox}
      </>
    );
  }

  const columnClass = visibleImages.length <= 4 ? "grid-cols-2" : "grid-cols-3";

  return (
    <div className={cn("grid gap-1.5", columnClass, className)}>
      {visibleImages.map((image, index) => {
        const isLocalUpload = isLocalUploadUrl(image.url);
        const content = (
          <Image
            src={image.url}
            alt={image.alt}
            width={360}
            height={360}
            className="aspect-square w-full rounded-md object-cover transition-transform duration-500 group-hover:scale-[1.025] md:rounded-xl"
            priority={priority && index === 0}
            unoptimized={isLocalUpload}
          />
        );

        return href ? (
          <Link
            key={image.id}
            href={href}
            className="group block overflow-hidden rounded-md bg-muted md:rounded-xl"
          >
            {content}
          </Link>
        ) : (
          <button
            key={image.id}
            type="button"
            className="group block w-full cursor-zoom-in overflow-hidden rounded-md bg-muted text-left md:rounded-xl"
            onClick={() => setActiveIndex(index)}
          >
            {content}
          </button>
        );
      })}
      {lightbox}
    </div>
  );
};
