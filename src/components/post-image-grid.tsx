"use client";

import Image from "next/image";
import Link from "next/link";
import type { MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  previewOnMultiImage?: boolean;
};

type MagnifierState = {
  x: number;
  y: number;
  imageLeft: number;
  imageTop: number;
  imageWidth: number;
  imageHeight: number;
};

const magnifierSize = 210;
const magnifierGlassSize = 172;
const magnifierZoom = 3.4;

export const PostImageGrid = ({
  images,
  href,
  priority = false,
  className,
  previewOnMultiImage = false
}: PostImageGridProps) => {
  const visibleImages = images.slice(0, 9);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [magnifier, setMagnifier] = useState<MagnifierState | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const previewFrameRef = useRef<HTMLDivElement | null>(null);
  const activeImage = activeIndex === null ? null : visibleImages[activeIndex] ?? null;

  const hideMagnifier = () => {
    setMagnifier(null);
  };

  const closePreview = () => {
    setActiveIndex(null);
    hideMagnifier();
  };

  const handlePreviewMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const frame = previewFrameRef.current;

    if (!frame) {
      hideMagnifier();
      return;
    }

    const rect = frame.getBoundingClientRect();
    const isInsideFrame =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (!isInsideFrame) {
      hideMagnifier();
      return;
    }

    const xInImage = event.clientX - rect.left;
    const yInImage = event.clientY - rect.top;

    setMagnifier({
      x: xInImage,
      y: yInImage,
      imageLeft: magnifierGlassSize / 2 - xInImage * magnifierZoom,
      imageTop: magnifierGlassSize / 2 - yInImage * magnifierZoom,
      imageWidth: rect.width * magnifierZoom,
      imageHeight: rect.height * magnifierZoom
    });
  };

  const handleLightboxMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const frame = previewFrameRef.current;

    if (!frame) {
      hideMagnifier();
      return;
    }

    const rect = frame.getBoundingClientRect();
    const isInsideFrame =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (!isInsideFrame) {
      hideMagnifier();
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (activeIndex === null) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveIndex(null);
        setMagnifier(null);
        return;
      }

      if (event.key === "ArrowLeft") {
        setMagnifier(null);
        setActiveIndex((index) =>
          index === null ? index : (index - 1 + visibleImages.length) % visibleImages.length
        );
        return;
      }

      if (event.key === "ArrowRight") {
        setMagnifier(null);
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

  const lightboxContent = activeImage ? (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      onMouseMove={handleLightboxMouseMove}
      onClick={closePreview}
    >
      <button
        type="button"
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-lg font-semibold text-white transition-colors hover:bg-white/25"
        aria-label="Close image preview"
        onClick={closePreview}
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
      <div
        ref={previewFrameRef}
        className="relative cursor-none"
        onMouseMove={handlePreviewMouseMove}
        onMouseLeave={hideMagnifier}
        onClick={(event) => event.stopPropagation()}
      >
        <Image
          src={activeImage.url}
          alt={activeImage.alt}
          width={1600}
          height={1200}
          className="block max-h-[88vh] w-auto max-w-full rounded-lg object-contain"
          unoptimized={isLocalUploadUrl(activeImage.url)}
        />
        {magnifier ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute z-20 block rounded-full border-[7px] border-sky-100 bg-white/10 shadow-2xl shadow-black/45 ring-2 ring-white/80"
            style={{
              left: magnifier.x - magnifierSize / 2,
              top: magnifier.y - magnifierSize / 2,
              width: magnifierSize,
              height: magnifierSize
            }}
          >
            <span className="absolute -bottom-12 -right-8 h-20 w-7 rotate-[-42deg] rounded-full border border-sky-100 bg-sky-200 shadow-lg shadow-black/25" />
            <span
              className="absolute left-1/2 top-1/2 overflow-hidden rounded-full border-2 border-white/70 bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.32),inset_0_-14px_26px_rgba(14,165,233,0.13)]"
              style={{
                width: magnifierGlassSize,
                height: magnifierGlassSize,
                transform: "translate(-50%, -50%)"
              }}
            >
              <Image
                src={activeImage.url}
                alt=""
                width={1600}
                height={1200}
                className="absolute max-w-none select-none"
                draggable={false}
                unoptimized={isLocalUploadUrl(activeImage.url)}
                style={{
                  left: magnifier.imageLeft,
                  top: magnifier.imageTop,
                  width: magnifier.imageWidth,
                  height: magnifier.imageHeight,
                  filter: "contrast(1.08) saturate(1.06)"
                }}
              />
              <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_34%_26%,rgba(255,255,255,0.16),rgba(255,255,255,0.04)_22%,transparent_46%)]" />
              <span className="absolute inset-0 rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22),inset_14px_14px_20px_rgba(255,255,255,0.10),inset_-18px_-18px_24px_rgba(8,47,73,0.22)]" />
            </span>
            <span className="absolute left-12 top-9 h-5 w-14 -rotate-12 rounded-full bg-white/28 blur-[1px]" />
            <span className="absolute -right-5 top-7 h-4 w-4 rounded-full bg-white shadow-sm" />
            <span className="absolute -right-8 top-12 h-2 w-2 rounded-full bg-sky-100 shadow-sm" />
          </div>
        ) : null}
      </div>
    </div>
  ) : null;
  const lightbox =
    isMounted && lightboxContent ? createPortal(lightboxContent, document.body) : null;

  const shouldLinkImages = !!href && (!previewOnMultiImage || visibleImages.length === 1);

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

    return shouldLinkImages ? (
      <Link href={href} className={cn("group block overflow-hidden rounded-lg md:rounded-2xl", className)}>
        {content}
      </Link>
    ) : (
      <>
        <button
          type="button"
          className={cn(
            "group block w-full overflow-hidden rounded-lg text-left md:rounded-2xl",
            className
          )}
          aria-label={`放大图片：${image.alt}`}
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

        return shouldLinkImages ? (
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
            className="group block w-full overflow-hidden rounded-md bg-muted text-left md:rounded-xl"
            aria-label={`放大图片：${image.alt}`}
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
