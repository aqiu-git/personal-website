import { NextRequest, NextResponse } from "next/server";
import { getRequestAdmin } from "@/lib/auth";
import { jsonError, parseJson } from "@/lib/api";
import { getPublishedPosts } from "@/lib/posts";
import { prisma } from "@/lib/prisma";
import { isSameOriginRequest } from "@/lib/security";
import { postMutationSchema, postQuerySchema } from "@/lib/validation";

export const GET = async (request: NextRequest) => {
  try {
    const query = postQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const posts = await getPublishedPosts(query);

    return NextResponse.json({ posts });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Invalid query", 400);
  }
};

export const POST = async (request: NextRequest) => {
  if (!isSameOriginRequest(request)) {
    return jsonError("Invalid origin", 403);
  }

  const admin = await getRequestAdmin(request);

  if (!admin) {
    return jsonError("Unauthorized", 401);
  }

  try {
    const body = await parseJson(request, postMutationSchema);
    const { mediaIds, ...postData } = body;
    const post = await prisma.post.create({
      data: {
        ...postData,
        authorId: admin.id,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
        media: mediaIds?.length
          ? {
              create: mediaIds.map((mediaId, index) => ({
                mediaId,
                sort: index
              }))
            }
          : undefined
      }
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Create post failed", 400);
  }
};

export const PATCH = async (request: NextRequest) => {
  if (!isSameOriginRequest(request)) {
    return jsonError("Invalid origin", 403);
  }

  const admin = await getRequestAdmin(request);

  if (!admin) {
    return jsonError("Unauthorized", 401);
  }

  try {
    const rawBody = (await request.json()) as unknown;
    const id = typeof rawBody === "object" && rawBody && "id" in rawBody ? rawBody.id : undefined;

    if (typeof id !== "string") {
      return jsonError("Post id is required");
    }

    const body = postMutationSchema.partial().parse(rawBody);
    const { mediaIds, ...postData } = body;
    const post = await prisma.$transaction(async (tx) => {
      const updatedPost = await tx.post.update({
        where: { id },
        data: {
          ...postData,
          publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined
        }
      });

      if (mediaIds) {
        await tx.postMedia.deleteMany({ where: { postId: id } });

        if (mediaIds.length > 0) {
          await tx.postMedia.createMany({
            data: mediaIds.map((mediaId, index) => ({
              postId: id,
              mediaId,
              sort: index
            })),
            skipDuplicates: true
          });
        }
      }

      return updatedPost;
    });

    return NextResponse.json({ post });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Update post failed", 400);
  }
};

export const DELETE = async (request: NextRequest) => {
  if (!isSameOriginRequest(request)) {
    return jsonError("Invalid origin", 403);
  }

  const admin = await getRequestAdmin(request);

  if (!admin) {
    return jsonError("Unauthorized", 401);
  }

  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return jsonError("Post id is required");
  }

  const post = await prisma.post.update({
    where: { id },
    data: { deletedAt: new Date() }
  });

  return NextResponse.json({ post });
};
