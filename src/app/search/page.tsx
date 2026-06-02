import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPublishedPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const { q } = await searchParams;
  const posts = await getPublishedPosts({ q });

  return (
    <main className="container space-y-8 py-12">
      <section className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-normal">搜索</h1>
        <form className="flex max-w-xl gap-2">
          <Input name="q" placeholder="标题、正文、标签、分类" defaultValue={q} />
          <Button type="submit">搜索</Button>
        </form>
      </section>
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </section>
    </main>
  );
};

export default SearchPage;
