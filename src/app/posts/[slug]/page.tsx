import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarkdownContent } from "@/components/markdown-content";
import { PostImageGrid } from "@/components/post-image-grid";
import { PostCommentsPanel } from "@/components/post-comments-panel";
import { PostReactionBar } from "@/components/post-reaction-bar";
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
  const imageMedia = post.media
    .map((item) => item.media)
    .filter((media) => media.type === "IMAGE")
    .map((media) => ({
      id: media.id,
      url: media.url,
      alt: media.alt ?? post.title
    }));
  const gridImages =
    imageMedia.length > 0
      ? imageMedia
      : post.coverImage
        ? [{ id: post.id, url: post.coverImage, alt: post.title }]
        : [];
  const trimmedContent = post.content.trim();
  const duplicateImageOnlyContent =
    gridImages.length > 0 &&
    gridImages.some((image) => {
      const escapedUrl = image.url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`^!\\[[^\\]]*\\]\\(${escapedUrl}\\)$`).test(trimmedContent);
    });
  const visibleContent = duplicateImageOnlyContent ? "" : post.content;

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

        {gridImages.length > 0 ? (
          <div className="space-y-3">
            <PostImageGrid images={gridImages} priority display="detail" />
            <div className="flex flex-wrap gap-2">
              {gridImages.map((image, index) => {
                const downloadHref = getDownloadHref(image.url, `${post.slug}-${index + 1}`);

                return downloadHref ? (
                  <a
                    key={image.id}
                    href={downloadHref}
                    className="inline-flex h-9 items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 text-xs font-medium text-emerald-800 hover:bg-emerald-100"
                  >
                    下载图片 {index + 1}
                  </a>
                ) : null;
              })}
            </div>
          </div>
        ) : null}

        {cameraItems.length > 0 ? (
          <section className="grid gap-2 rounded-lg border border-border p-4 text-sm text-muted-foreground md:grid-cols-3">
            {cameraItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </section>
        ) : null}

        {visibleContent ? <MarkdownContent content={visibleContent} /> : null}
      </article>

      <section className="space-y-3" aria-label="评论互动">
        <PostReactionBar postId={post.id} />
        <PostCommentsPanel postId={post.id} comments={post.comments} id="comments" />
      </section>
    </main>
  );
};

export default PostPage;
