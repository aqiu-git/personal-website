import { PostStatus, type PostType, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type PostFilters = {
  category?: string;
  q?: string;
  year?: number;
  month?: number;
  type?: PostType;
};

export const buildPostWhere = (filters: PostFilters): Prisma.PostWhereInput => {
  const where: Prisma.PostWhereInput = {
    deletedAt: null,
    status: PostStatus.PUBLISHED
  };

  if (filters.category) {
    where.category = {
      OR: [{ slug: filters.category }, { parent: { slug: filters.category } }]
    };
  }

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
      { content: { contains: filters.q, mode: "insensitive" } },
      { tags: { some: { tag: { name: { contains: filters.q, mode: "insensitive" } } } } },
      { category: { name: { contains: filters.q, mode: "insensitive" } } }
    ];
  }

  if (filters.year) {
    const start = new Date(Date.UTC(filters.year, (filters.month ?? 1) - 1, 1));
    const end = filters.month
      ? new Date(Date.UTC(filters.year, filters.month, 1))
      : new Date(Date.UTC(filters.year + 1, 0, 1));

    where.publishedAt = {
      gte: start,
      lt: end
    };
  }

  return where;
};

export const postInclude = {
  category: {
    include: {
      parent: true
    }
  },
  media: {
    include: {
      media: true
    },
    orderBy: {
      sort: "asc"
    }
  },
  tags: {
    include: {
      tag: true
    }
  },
  comments: {
    where: {
      status: "APPROVED",
      deletedAt: null,
      parentId: null
    },
    select: {
      id: true,
      nickname: true,
      content: true,
      createdAt: true,
      highlighted: true
    },
    orderBy: [{ highlighted: "desc" }, { createdAt: "desc" }],
    take: 3
  },
  _count: {
    select: {
      comments: {
        where: {
          status: "APPROVED",
          deletedAt: null
        }
      }
    }
  }
} satisfies Prisma.PostInclude;

export const getPublishedPosts = (filters: PostFilters = {}) =>
  prisma.post.findMany({
    where: buildPostWhere(filters),
    include: postInclude,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }]
  });

export const getPublishedPostBySlug = (slug: string) =>
  prisma.post.findFirst({
    where: {
      slug,
      status: PostStatus.PUBLISHED,
      deletedAt: null
    },
    include: {
      ...postInclude,
      comments: {
        where: {
          status: "APPROVED",
          deletedAt: null,
          parentId: null
        },
        include: {
          replies: {
            where: {
              status: "APPROVED",
              deletedAt: null
            },
            orderBy: {
              createdAt: "asc"
            }
          }
        },
        orderBy: [{ highlighted: "desc" }, { createdAt: "desc" }]
      }
    }
  });

export const getCategories = () =>
  prisma.category.findMany({
    where: {
      deletedAt: null,
      parentId: null
    },
    include: {
      children: {
        where: {
          deletedAt: null
        },
        orderBy: {
          sort: "asc"
        }
      }
    },
    orderBy: {
      sort: "asc"
    }
  });
