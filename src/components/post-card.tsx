import type { Post, Category } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

type PostCardProps = {
  post: Post & {
    category: Category & {
      parent?: Category | null;
    };
  };
  priority?: boolean;
};

export const PostCard = ({ post, priority = false }: PostCardProps) => (
  <Card className="break-inside-avoid overflow-hidden">
    {post.coverImage ? (
      <Link href={`/posts/${post.slug}`} className="block">
        <Image
          src={post.coverImage}
          alt={post.title}
          width={900}
          height={620}
          className="aspect-[4/3] w-full object-cover"
          priority={priority}
        />
      </Link>
    ) : null}
    <CardContent className="space-y-3 p-5">
      <div className="flex flex-wrap gap-2">
        <Badge>{post.category.parent?.name ?? post.category.name}</Badge>
        <Badge>{post.type}</Badge>
      </div>
      <Link href={`/posts/${post.slug}`} className="block hover:text-primary">
        <h2 className="text-xl font-semibold tracking-normal">{post.title}</h2>
      </Link>
      <p className="text-sm leading-6 text-muted-foreground">{post.summary ?? post.description}</p>
      <p className="text-xs text-muted-foreground">
        {formatDate(post.publishedAt ?? post.createdAt)}
      </p>
    </CardContent>
  </Card>
);
