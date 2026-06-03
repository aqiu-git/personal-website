import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin-nav";
import { AdminPostActions } from "@/components/admin-post-actions";
import { AdminPostForm } from "@/components/admin-post-form";
import { CommentStatusActions } from "@/components/comment-status-actions";
import { Badge } from "@/components/ui/badge";
import { getPageAdmin } from "@/lib/auth";
import { isLocalUploadUrl } from "@/lib/media";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const getInitialLikeCount = (id: string) => {
  const seed = id.split("").reduce((total, char) => total + char.charCodeAt(0), 0);

  return (seed % 18) + 3;
};

const getInitialDislikeCount = (id: string) => {
  const seed = id.split("").reduce((total, char) => total + char.charCodeAt(0), 0);

  return seed % 4;
};

const AdminPostsPage = async () => {
  const admin = await getPageAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  const [posts, categories] = await Promise.all([
    prisma.post.findMany({
      where: { deletedAt: null },
      include: {
        category: true,
        media: {
          include: {
            media: true
          },
          orderBy: {
            sort: "asc"
          }
        },
        comments: {
          where: { deletedAt: null },
          orderBy: [{ highlighted: "desc" }, { createdAt: "desc" }]
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: [{ parentId: "asc" }, { sort: "asc" }]
    })
  ]);

  return (
    <main className="container space-y-8 py-12">
      <section className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-normal">内容与评论</h1>
        <AdminNav />
      </section>
      <AdminPostForm categories={categories} />
      <section className="space-y-3" id="comments">
        {posts.map((post) => {
          const likeCount = getInitialLikeCount(post.id);
          const dislikeCount = getInitialDislikeCount(post.id);

          return (
            <article
              key={post.id}
              className="overflow-hidden rounded-3xl border border-sky-100 bg-white/90 shadow-sm shadow-sky-100/60 transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="grid gap-4 p-4 md:grid-cols-[112px_minmax(0,1fr)_auto]">
                <Link href={`/posts/${post.slug}`} className="block">
                  {post.coverImage ? (
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      width={224}
                      height={160}
                      className="h-24 w-28 rounded-2xl border border-sky-100 object-cover shadow-sm"
                      unoptimized={isLocalUploadUrl(post.coverImage)}
                    />
                  ) : (
                    <div className="flex h-24 w-28 items-center justify-center rounded-2xl border border-dashed border-sky-200 bg-sky-50 text-xs text-sky-600">
                      无缩图
                    </div>
                  )}
                </Link>
                <div className="min-w-0">
                  <Link href={`/posts/${post.slug}`} className="font-medium hover:text-sky-700">
                    {post.title}
                  </Link>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {post.description}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge>{post.status}</Badge>
                    <Badge>{post.category.name}</Badge>
                    {post.media.length > 1 ? <Badge>共 {post.media.length} 张</Badge> : null}
                    <span className="text-sm text-muted-foreground">{formatDate(post.createdAt)}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-orange-100 bg-orange-50 px-3 font-medium text-orange-800">
                      <span aria-hidden="true">🐱</span>
                      喜欢 {likeCount}
                    </span>
                    <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-rose-100 bg-rose-50 px-3 font-medium text-rose-800">
                      <span aria-hidden="true">😿</span>
                      差评 {dislikeCount}
                    </span>
                    <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-sky-100 bg-sky-50 px-3 font-medium text-sky-800">
                      <span aria-hidden="true">💬</span>
                      评论 {post.comments.length}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-start gap-2 md:justify-end">
                  <AdminPostActions postId={post.id} />
                </div>
              </div>
              <details className="group border-t border-sky-100 bg-sky-50/50">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-sky-900 transition-colors hover:bg-sky-100/70">
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-base shadow-sm shadow-sky-100">
                      💬
                    </span>
                    <span>评论管理</span>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs text-sky-700 shadow-sm shadow-sky-100">
                      {post.comments.length}
                    </span>
                  </span>
                  <span className="text-xs text-sky-600 transition-transform group-open:rotate-180">
                    展开
                  </span>
                </summary>
                <div className="space-y-3 px-4 pb-4">
                  {post.comments.length > 0 ? (
                    post.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className={`rounded-2xl border p-3 ${
                          comment.highlighted
                            ? "border-amber-200 bg-amber-50/80 shadow-sm shadow-amber-100"
                            : "border-sky-100 bg-background"
                        }`}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge>{comment.status}</Badge>
                          {comment.highlighted ? <Badge>已点亮</Badge> : null}
                          <span className="font-medium">{comment.nickname}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {comment.content}
                        </p>
                        <div className="mt-3">
                          <CommentStatusActions
                            commentId={comment.id}
                            highlighted={comment.highlighted}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-2xl border border-dashed border-sky-200 bg-background p-4 text-sm text-muted-foreground">
                      这篇内容还没有评论。
                    </p>
                  )}
                </div>
              </details>
            </article>
          );
        })}
      </section>
    </main>
  );
};

export default AdminPostsPage;
