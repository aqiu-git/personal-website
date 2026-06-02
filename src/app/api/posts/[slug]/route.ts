import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { getPublishedPostBySlug } from "@/lib/posts";

type PostRouteProps = {
  params: Promise<{ slug: string }>;
};

export const GET = async (_request: NextRequest, { params }: PostRouteProps) => {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    return jsonError("Post not found", 404);
  }

  return NextResponse.json({ post });
};
