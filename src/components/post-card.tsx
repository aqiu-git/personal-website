import type { Post, Category } from "@prisma/client";
import Link from "next/link";
import { PostImageGrid } from "@/components/post-image-grid";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

type PostCardProps = {
  post: Post & {
    category: Category & {
      parent?: Category | null;
    };
    media?: Array<{
      media: {
        id: string;
        url: string;
        type: string;
        alt?: string | null;
      };
    }>;
  };
  priority?: boolean;
};

export const PostCard = ({ post, priority = false }: PostCardProps) => {
  const images =
    post.media
      ?.map((item) => item.media)
      .filter((media) => media.type === "IMAGE")
      .map((media) => ({
        id: media.id,
        url: media.url,
        alt: media.alt ?? post.title
      })) ?? [];
  const gridImages =
    images.length > 0
      ? images
      : post.coverImage
        ? [{ id: post.id, url: post.coverImage, alt: post.title }]
        : [];

  return (
    <Card className="break-inside-avoid overflow-hidden">
      <PostImageGrid
        images={gridImages}
        href={`/posts/${post.slug}`}
        priority={priority}
        className="rounded-none p-0"
      />
      <CardContent className="space-y-2.5 p-4 md:space-y-3 md:p-5">
        <div className="flex flex-wrap gap-2">
          <Badge>{post.category.parent?.name ?? post.category.name}</Badge>
          <Badge>{post.type}</Badge>
        </div>
        <Link href={`/posts/${post.slug}`} className="block hover:text-primary">
          <h2 className="text-lg font-semibold tracking-normal md:text-xl">{post.title}</h2>
        </Link>
        <p className="line-clamp-2 text-sm leading-6 text-muted-foreground md:line-clamp-none">
          {post.summary ?? post.description}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDate(post.publishedAt ?? post.createdAt)}
        </p>
      </CardContent>
    </Card>
  );
};
