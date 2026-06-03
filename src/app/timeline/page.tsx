import Link from "next/link";
import { PostImageGrid } from "@/components/post-image-grid";
import { TimelinePostInteractions } from "@/components/timeline-post-interactions";
import { Badge } from "@/components/ui/badge";
import { getPublishedPosts } from "@/lib/posts";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TimelinePage = async () => {
  const posts = await getPublishedPosts();
  const groups = posts.reduce<Record<string, typeof posts>>((acc, post) => {
    const date = post.publishedAt ?? post.createdAt;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    acc[key] = [...(acc[key] ?? []), post];
    return acc;
  }, {});

  return (
    <main className="bg-[linear-gradient(180deg,rgba(255,247,237,0.65),rgba(255,255,255,0)_360px)]">
      <div className="container max-w-4xl space-y-8 py-12">
        <section>
          <p className="text-sm font-medium text-orange-400">Timeline</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal">时间轴</h1>
          <p className="mt-3 text-muted-foreground">所有公开内容按年月倒序排列。</p>
        </section>
        <section className="space-y-8">
          {Object.entries(groups).map(([month, items]) => (
            <div key={month} className="space-y-4 border-l border-orange-100 pl-5">
              <h2 className="text-xl font-semibold tracking-normal">{month}</h2>
              {items.map((post) => (
                <article
                  key={post.id}
                  className="rounded-3xl border border-orange-100 bg-card p-3 shadow-sm shadow-orange-100/70 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className="grid gap-4 md:grid-cols-[156px_minmax(0,1fr)]">
                    <TimelineImages post={post} />
                    <div className="min-w-0 py-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="border-orange-100 bg-orange-50 text-orange-700">
                          {post.category.parent?.name ?? post.category.name}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(post.publishedAt ?? post.createdAt)}
                        </span>
                      </div>
                      <Link href={`/posts/${post.slug}`} className="mt-3 block hover:text-orange-700">
                        <p className="font-medium">{post.title}</p>
                      </Link>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {post.description}
                      </p>
                    </div>
                  </div>
                  <TimelinePostInteractions
                    postId={post.id}
                    commentCount={post._count.comments}
                    comments={post.comments}
                  />
                </article>
              ))}
            </div>
          ))}
        </section>
      </div>
    </main>
  );
};

export default TimelinePage;

const TimelineImages = ({ post }: { post: Awaited<ReturnType<typeof getPublishedPosts>>[number] }) => {
  const images = post.media
    .map((item) => item.media)
    .filter((media) => media.type === "IMAGE")
    .map((media) => ({
      id: media.id,
      url: media.url,
      alt: media.alt ?? post.title
    }));
  const gridImages =
    images.length > 0
      ? images
      : post.coverImage
        ? [{ id: post.id, url: post.coverImage, alt: post.title }]
        : [];

  return gridImages.length > 0 ? (
    <PostImageGrid images={gridImages} href={`/posts/${post.slug}`} />
  ) : (
    <div className="flex aspect-[16/11] items-center justify-center rounded-2xl bg-orange-50 text-xs text-muted-foreground">
      无缩图
    </div>
  );
};
