import Image from "next/image";
import Link from "next/link";
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

  if (visibleImages.length === 0) {
    return null;
  }

  if (visibleImages.length === 1) {
    const image = visibleImages[0];
    const isLocalUpload = isLocalUploadUrl(image.url);
    const content = (
      <Image
        src={image.url}
        alt={image.alt}
        width={900}
        height={620}
        className="aspect-[4/3] w-full rounded-2xl object-cover transition-transform duration-500 group-hover:scale-[1.025]"
        priority={priority}
        unoptimized={isLocalUpload}
      />
    );

    return href ? (
      <Link href={href} className={cn("group block overflow-hidden rounded-2xl", className)}>
        {content}
      </Link>
    ) : (
      <div className={cn("overflow-hidden rounded-2xl", className)}>{content}</div>
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
            className="aspect-square w-full rounded-xl object-cover transition-transform duration-500 group-hover:scale-[1.025]"
            priority={priority && index === 0}
            unoptimized={isLocalUpload}
          />
        );

        return href ? (
          <Link
            key={image.id}
            href={href}
            className="group block overflow-hidden rounded-xl bg-muted"
          >
            {content}
          </Link>
        ) : (
          <div key={image.id} className="overflow-hidden rounded-xl bg-muted">
            {content}
          </div>
        );
      })}
    </div>
  );
};
