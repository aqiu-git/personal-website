import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryTimeline } from "@/components/category-timeline";
import { prisma } from "@/lib/prisma";
import { getPublishedPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ child?: string }>;
};

export const generateMetadata = async ({ params }: CategoryPageProps): Promise<Metadata> => {
  const { slug } = await params;
  const category = await prisma.category.findFirst({ where: { slug, deletedAt: null } });

  return {
    title: category?.name ?? "分类",
    description: category?.description ?? "分类内容列表"
  };
};

const CategoryPage = async ({ params, searchParams }: CategoryPageProps) => {
  const { slug } = await params;
  const { child: selectedChildSlug } = await searchParams;
  const category = await prisma.category.findFirst({
    where: { slug, deletedAt: null },
    include: { children: { where: { deletedAt: null }, orderBy: { sort: "asc" } } }
  });

  if (!category) {
    notFound();
  }

  const posts = await getPublishedPosts({ category: slug });
  const hasSelectedChild = category.children.some(
    (childCategory) => childCategory.slug === selectedChildSlug
  );
  const filteredPosts =
    selectedChildSlug && hasSelectedChild
      ? posts.filter((post) => post.category.slug === selectedChildSlug)
      : posts;
  const timelinePosts = filteredPosts.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    description: post.description,
    summary: post.summary,
    type: post.type,
    coverImage: post.coverImage,
    media: post.media
      .map((item) => item.media)
      .filter((media) => media.type === "IMAGE")
      .map((media) => ({
        id: media.id,
        url: media.url,
        alt: media.alt ?? post.title
      })),
    publishedAt: post.publishedAt?.toISOString() ?? null,
    createdAt: post.createdAt.toISOString(),
    categoryName: post.category.name,
    parentCategoryName: post.category.parent?.name ?? null,
    commentCount: post._count.comments,
    comments: post.comments.map((comment) => ({
      id: comment.id,
      nickname: comment.nickname,
      content: comment.content,
      highlighted: comment.highlighted,
      createdAt: comment.createdAt.toISOString()
    }))
  }));
  const chipBase =
    "inline-flex origin-center items-center rounded-full border px-3 py-1.5 text-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-105";
  const activeCategoryClass =
    `${chipBase} border-orange-200 bg-orange-100 font-semibold text-orange-700 shadow-sm shadow-orange-100`;
  const inactiveCategoryClass =
    `${chipBase} border-orange-100 bg-white/80 text-muted-foreground hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700`;

  return (
    <main className="bg-[linear-gradient(180deg,rgba(255,247,237,0.65),rgba(255,255,255,0)_360px)]">
      <div className="container space-y-9 py-12">
        <section className="space-y-4">
          <p className="text-sm font-medium text-orange-400">Category</p>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-normal md:text-5xl">{category.name}</h1>
            <p className="max-w-2xl leading-7 text-muted-foreground">{category.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/categories/${category.slug}`}
              className={
                selectedChildSlug && hasSelectedChild ? inactiveCategoryClass : activeCategoryClass
              }
            >
              全部
            </Link>
            {category.children.map((childCategory) => (
              <Link
                key={childCategory.id}
                href={`/categories/${category.slug}?child=${childCategory.slug}`}
                className={
                  childCategory.slug === selectedChildSlug && hasSelectedChild
                    ? activeCategoryClass
                    : inactiveCategoryClass
                }
              >
                {childCategory.name}
              </Link>
            ))}
          </div>
        </section>
        <CategoryTimeline posts={timelinePosts} />
      </div>
    </main>
  );
};

export default CategoryPage;
