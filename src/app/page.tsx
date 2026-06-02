import Link from "next/link";
import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCategories, getPublishedPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

const HomePage = async () => {
  const [categories, posts] = await Promise.all([getCategories(), getPublishedPosts()]);
  const latestPosts = posts.slice(0, 6);

  return (
    <main>
      <section className="container grid min-h-[calc(100vh-4rem)] content-center gap-10 py-12 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-7">
          <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground">Life / Cats / Photos / Tech</p>
            <h1 className="max-w-2xl text-5xl font-semibold tracking-normal md:text-7xl">
              AQ Space
            </h1>
            <p className="max-w-xl text-lg leading-8 text-muted-foreground">
              一个长期运营的个人内容空间，用统一的 Post 模型承载生活、猫咪、摄影和技术文章。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/categories/photography">查看摄影</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/timeline">时间轴</Link>
            </Button>
          </div>
        </div>
        <div className="masonry">
          {latestPosts.slice(0, 4).map((post, index) => (
            <div key={post.id} className="mb-4">
              <PostCard post={post} priority={index === 0} />
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-muted/35 py-12">
        <div className="container grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle>{category.name}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="secondary" size="sm">
                  <Link href={`/categories/${category.slug}`}>进入板块</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container space-y-6 py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-normal">最新动态</h2>
            <p className="text-sm text-muted-foreground">倒序展示所有公开内容。</p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/search">搜索</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {latestPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </main>
  );
};

export default HomePage;
