import { NextRequest, NextResponse } from "next/server";
import { getRequestAdmin } from "@/lib/auth";
import { jsonError, parseJson } from "@/lib/api";
import { getCategories } from "@/lib/posts";
import { prisma } from "@/lib/prisma";
import { isSameOriginRequest } from "@/lib/security";
import { categoryMutationSchema } from "@/lib/validation";

export const GET = async () => {
  const categories = await getCategories();

  return NextResponse.json({ categories });
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
    const body = await parseJson(request, categoryMutationSchema);
    const category = await prisma.category.create({ data: body });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Create category failed", 400);
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
      return jsonError("Category id is required");
    }

    const body = categoryMutationSchema.partial().parse(rawBody);
    const category = await prisma.category.update({
      where: { id },
      data: body
    });

    return NextResponse.json({ category });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Update category failed", 400);
  }
};
