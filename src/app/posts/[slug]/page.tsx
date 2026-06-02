import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MarkdownContent } from "@/components/markdown-content";
import { PostCommentsPanel } from "@/components/post-comments-panel";
import { Badge } from "@/components/ui/badge";
import { getDownloadHref } from "@/lib/download";
import { getPublishedPostBySlug } from "@/lib/posts";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PostPageProps = {
  params: Promise<{ slug: string }>;
};

export const generateMetadata = async ({ params }: PostPageProps): Promise<Metadata> => {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  return {
    title: post?.title ?? "内容",
    description: post?.description ?? "个人网站内容"
  };
};

const PostPage = async ({ params }: PostPageProps) => {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const cameraItems = [
    post.cameraModel,
    post.lens,
    post.aperture,
    post.shutter,
    post.iso,
    post.focalLength
  ].filter(Boolean);
  const downloadHref = getDownloadHref(post.coverImage, post.slug);

  return (
    <main className="container max-w-4xl space-y-10 py-12">
      <article className="space-y-8">
        <header className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge>{post.category.parent?.name ?? post.category.name}</Badge>
            <Badge>{post.category.name}</Badge>
            <Badge>{post.type}</Badge>
          </div>
          <h1 className="text-4xl font-semibold tracking-normal md:text-5xl">{post.title}</h1>
          <p className="text-lg leading-8 text-muted-foreground">{post.description}</p>
          <p className="text-sm text-muted-foreground">
            {formatDate(post.publishedAt ?? post.createdAt)} · 阅读 {post.viewCount}
          </p>
        </header>

        {post.coverImage ? (
          <div className="space-y-3">
            <Image
              src={post.coverImage}
              alt={post.title}
              width={1400}
              height={900}
              className="aspect-[16/10] w-full rounded-lg object-cover"
              priority
            />
            {downloadHref ? (
              <a
                href={downloadHref}
                className="inline-flex h-9 items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 text-xs font-medium text-emerald-800 hover:bg-emerald-100"
              >
                下载这张图
              </a>
            ) : null}
          </div>
        ) : null}

        {cameraItems.length > 0 ? (
          <section className="grid gap-2 rounded-lg border border-border p-4 text-sm text-muted-foreground md:grid-cols-3">
            {cameraItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </section>
        ) : null}

        <MarkdownContent content={post.content} />
      </article>

      <PostCommentsPanel postId={post.id} comments={post.comments} id="comments" />
    </main>
  );
};

export default PostPage;
