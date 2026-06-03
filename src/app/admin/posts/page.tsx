import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin-nav";
import { AdminPostActions } from "@/components/admin-post-actions";
import { AdminPostForm } from "@/components/admin-post-form";
import { CommentStatusActions } from "@/components/comment-status-actions";
import { Badge } from "@/components/ui/badge";
import { getPageAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

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
        {posts.map((post) => (
          <article key={post.id} className="overflow-hidden rounded-lg border border-border">
            <div className="grid gap-4 p-4 md:grid-cols-[112px_minmax(0,1fr)_auto]">
              <Link href={`/posts/${post.slug}`} className="block">
                {post.coverImage ? (
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    width={224}
                    height={160}
                    className="h-24 w-28 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-28 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                    无缩图
                  </div>
                )}
              </Link>
              <div className="min-w-0">
                <Link href={`/posts/${post.slug}`} className="font-medium hover:text-primary">
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
              </div>
              <div className="flex flex-wrap items-start gap-2 md:justify-end">
                <AdminPostActions postId={post.id} />
              </div>
            </div>
            <details className="border-t border-border bg-muted/20">
              <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground">
                评论管理 {post.comments.length}
              </summary>
              <div className="space-y-3 px-4 pb-4">
                {post.comments.length > 0 ? (
                  post.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`rounded-lg border p-3 ${
                        comment.highlighted ? "border-amber-200 bg-amber-50/80" : "border-border bg-background"
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
                  <p className="rounded-lg border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
                    这篇内容还没有评论。
                  </p>
                )}
              </div>
            </details>
          </article>
        ))}
      </section>
    </main>
  );
};

export default AdminPostsPage;
