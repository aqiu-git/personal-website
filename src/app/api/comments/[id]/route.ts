import { NextRequest, NextResponse } from "next/server";
import { getRequestAdmin } from "@/lib/auth";
import { jsonError, parseJson } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { isSameOriginRequest } from "@/lib/security";
import { commentStatusSchema } from "@/lib/validation";

type CommentRouteProps = {
  params: Promise<{ id: string }>;
};

export const PATCH = async (request: NextRequest, { params }: CommentRouteProps) => {
  if (!isSameOriginRequest(request)) {
    return jsonError("Invalid origin", 403);
  }

  const admin = await getRequestAdmin(request);

  if (!admin) {
    return jsonError("Unauthorized", 401);
  }

  try {
    const { id } = await params;
    const body = await parseJson(request, commentStatusSchema);

    if (body.status === undefined && body.highlighted === undefined) {
      return jsonError("No update payload");
    }

    const comment = await prisma.comment.update({
      where: { id },
      data: body
    });

    return NextResponse.json({ comment });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Update comment failed", 400);
  }
};

export const DELETE = async (request: NextRequest, { params }: CommentRouteProps) => {
  if (!isSameOriginRequest(request)) {
    return jsonError("Invalid origin", 403);
  }

  const admin = await getRequestAdmin(request);

  if (!admin) {
    return jsonError("Unauthorized", 401);
  }

  try {
    const { id } = await params;
    const comment = await prisma.comment.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    return NextResponse.json({ comment });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Delete comment failed", 400);
  }
};
