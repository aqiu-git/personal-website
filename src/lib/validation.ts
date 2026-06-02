import { CommentStatus, PostStatus, PostType } from "@prisma/client";
import { z } from "zod";

const localAdminEmailSchema = z
  .string()
  .trim()
  .refine(
    (value) => z.string().email().safeParse(value).success || /^[^\s@]+@localhost$/.test(value),
    "Invalid email"
  );
const mediaUrlSchema = z.union([z.string().url(), z.string().regex(/^\/uploads\/[A-Za-z0-9._-]+$/)]);

export const loginSchema = z.object({
  email: localAdminEmailSchema,
  password: z.string().min(8)
});

export const postQuerySchema = z.object({
  category: z.string().optional(),
  q: z.string().optional(),
  year: z.coerce.number().int().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  type: z.nativeEnum(PostType).optional()
});

export const postMutationSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().min(1),
  content: z.string().min(1),
  summary: z.string().optional(),
  type: z.nativeEnum(PostType).default(PostType.ARTICLE),
  status: z.nativeEnum(PostStatus).default(PostStatus.DRAFT),
  coverImage: mediaUrlSchema.optional(),
  categoryId: z.string().min(1),
  publishedAt: z.string().datetime().optional(),
  mediaIds: z.array(z.string().min(1)).max(20).optional()
});

export const categoryMutationSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  parentId: z.string().optional(),
  sort: z.number().int().default(0)
});

export const commentCreateSchema = z.object({
  postId: z.string().min(1),
  nickname: z.string().min(1).max(40),
  email: z.string().email(),
  content: z.string().min(2).max(1000),
  parentId: z.string().optional()
});

export const commentStatusSchema = z.object({
  status: z.nativeEnum(CommentStatus).optional(),
  highlighted: z.boolean().optional()
});

export const mediaCreateSchema = z.object({
  url: z.string().min(1),
  type: z.enum(["IMAGE", "VIDEO"]),
  mimeType: z.string().min(1),
  width: z.number().int().optional(),
  height: z.number().int().optional(),
  alt: z.string().optional(),
  caption: z.string().optional(),
  storageKey: z.string().optional()
});
