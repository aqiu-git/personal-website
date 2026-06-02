import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const posts = await prisma.post.findMany({
    where: { deletedAt: null, status: "PUBLISHED" },
    select: { slug: true, updatedAt: true }
  });
  const categories = await prisma.category.findMany({
    where: { deletedAt: null },
    select: { slug: true, updatedAt: true }
  });

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/timeline`, lastModified: new Date() },
    { url: `${baseUrl}/search`, lastModified: new Date() },
    ...categories.map((category) => ({
      url: `${baseUrl}/categories/${category.slug}`,
      lastModified: category.updatedAt
    })),
    ...posts.map((post) => ({
      url: `${baseUrl}/posts/${post.slug}`,
      lastModified: post.updatedAt
    }))
  ];
};

export default sitemap;
