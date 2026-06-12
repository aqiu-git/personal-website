import Link from "next/link";
import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCategories, getPublishedPosts } from "@/lib/posts";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const categoryStyles: Record<
  string,
  {
    icon: string;
    card: string;
    iconWrap: string;
    button: string;
    accent: string;
  }
> = {
  life: {
    icon: "☕",
    card: "border-orange-100 bg-gradient-to-br from-white via-orange-50/70 to-white shadow-orange-100/70",
    iconWrap: "bg-orange-100 text-orange-700",
    button: "bg-orange-100 text-orange-900 hover:bg-orange-200",
    accent: "bg-orange-200"
  },
  cats: {
    icon: "🐱",
    card: "border-rose-100 bg-gradient-to-br from-white via-rose-50/70 to-white shadow-rose-100/70",
    iconWrap: "bg-rose-100 text-rose-700",
    button: "bg-rose-100 text-rose-900 hover:bg-rose-200",
    accent: "bg-rose-200"
  },
  photography: {
    icon: "◐",
    card: "border-sky-100 bg-gradient-to-br from-white via-sky-50/80 to-white shadow-sky-100/70",
    iconWrap: "bg-sky-100 text-sky-700",
    button: "bg-sky-100 text-sky-900 hover:bg-sky-200",
    accent: "bg-sky-200"
  },
  tech: {
    icon: "</>",
    card: "border-cyan-100 bg-gradient-to-br from-white via-cyan-50/70 to-white shadow-cyan-100/70",
    iconWrap: "bg-cyan-100 text-cyan-700",
    button: "bg-cyan-100 text-cyan-900 hover:bg-cyan-200",
    accent: "bg-cyan-200"
  }
};

const fallbackCategoryStyle = {
  icon: "✦",
  card: "border-sky-100 bg-gradient-to-br from-white via-sky-50/70 to-white shadow-sky-100/70",
  iconWrap: "bg-sky-100 text-sky-700",
  button: "bg-sky-100 text-sky-900 hover:bg-sky-200",
  accent: "bg-sky-200"
};

const HomePage = async () => {
  const [categories, posts] = await Promise.all([getCategories(), getPublishedPosts()]);
  const latestPosts = posts.slice(0, 6);

  return (
    <main>
      <section className="border-b border-sky-100/70 bg-gradient-to-b from-sky-50/50 via-white to-white">
        <div className="container grid content-start gap-8 py-10 md:gap-10 md:py-14 lg:min-h-[calc(100vh-4rem)] lg:content-center lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6 md:space-y-7">
          <div className="space-y-3 md:space-y-4">
            <p className="inline-flex rounded-full border border-sky-100 bg-white/80 px-3 py-1 text-sm font-medium text-sky-800 shadow-sm shadow-sky-100/60">
              Life / Cats / Photos / Tech
            </p>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-normal sm:text-5xl md:text-7xl">
              AQ Space
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
              一个长期运营的个人内容空间，用统一的 Post 模型承载生活、猫咪、摄影和技术文章。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="rounded-full bg-blue-500 px-5 hover:bg-blue-600">
              <Link href="/categories/photography">查看摄影</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full bg-white/80 px-5">
              <Link href="/timeline">时间轴</Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5">
              4 个主板块
            </span>
            <span className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5">
              统一内容模型
            </span>
            <span className="rounded-full border border-rose-100 bg-rose-50 px-3 py-1.5">
              图片与文字同轴记录
            </span>
          </div>
        </div>
        <div className="masonry lg:pt-2">
          {latestPosts.slice(0, 4).map((post, index) => (
            <div key={post.id} className={index > 0 ? "mb-4 hidden md:block" : "mb-4"}>
              <PostCard post={post} priority={index === 0} />
            </div>
          ))}
        </div>
        </div>
      </section>

      <section className="border-y border-sky-100 bg-gradient-to-b from-sky-50/45 via-white to-orange-50/35 py-8 md:py-12">
        <div className="container grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => {
            const style = categoryStyles[category.slug] ?? fallbackCategoryStyle;

            return (
              <Card
                key={category.id}
                className={cn(
                  "group relative overflow-hidden rounded-3xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md",
                  style.card
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute -right-5 -top-5 h-20 w-20 rounded-full opacity-45 blur-2xl transition-opacity group-hover:opacity-70",
                    style.accent
                  )}
                />
                <CardHeader className="relative p-5 pb-3">
                  <div
                    className={cn(
                      "mb-4 flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-semibold shadow-sm",
                      style.iconWrap
                    )}
                  >
                    {style.icon}
                  </div>
                  <CardTitle className="text-xl">{category.name}</CardTitle>
                  <CardDescription className="min-h-10 text-sm leading-6">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative flex items-center justify-between p-5 pt-1">
                  <Button
                    asChild
                    size="sm"
                    className={cn("rounded-full px-4 shadow-sm", style.button)}
                  >
                    <Link href={`/categories/${category.slug}`}>进入板块</Link>
                  </Button>
                  <span className="text-lg text-muted-foreground/50 transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="container space-y-5 py-8 md:space-y-6 md:py-12">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end sm:gap-4">
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
