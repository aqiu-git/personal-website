import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPageAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const AdminPage = async () => {
  const admin = await getPageAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  const [posts, comments, categories, media] = await Promise.all([
    prisma.post.count({ where: { deletedAt: null } }),
    prisma.comment.count({ where: { deletedAt: null } }),
    prisma.category.count({ where: { deletedAt: null } }),
    prisma.media.count({ where: { deletedAt: null } })
  ]);

  return (
    <main className="container space-y-8 py-12">
      <section className="space-y-4">
        <p className="text-sm text-muted-foreground">你好，{admin.name}</p>
        <h1 className="text-4xl font-semibold tracking-normal">后台管理</h1>
        <AdminNav />
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>内容与评论</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-3xl font-semibold">{posts}</p>
            <p className="text-sm text-muted-foreground">评论 {comments}</p>
          </CardContent>
        </Card>
        {[
          ["分类", categories],
          ["媒体", media]
        ].map(([label, value]) => (
          <Card key={label}>
            <CardHeader>
              <CardTitle>{label}</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">{value}</CardContent>
          </Card>
        ))}
      </section>
      <section className="rounded-lg border border-border p-4">
        <h2 className="text-xl font-semibold">快速发布</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          文本、图片和评论管理都在内容与评论里，发布后会自动进入对应分类和时间轴。
        </p>
        <Link
          href="/admin/posts"
          className="mt-4 inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          去内容与评论
        </Link>
      </section>
    </main>
  );
};

export default AdminPage;
