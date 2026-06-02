import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { jsonError, parseJson } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { canSubmitComment } from "@/lib/rate-limit";
import { isSameOriginRequest } from "@/lib/security";
import { commentCreateSchema } from "@/lib/validation";

const hashValue = (value: string) => createHash("sha256").update(value).digest("hex");

export const POST = async (request: NextRequest) => {
  if (!isSameOriginRequest(request)) {
    return jsonError("Invalid origin", 403);
  }

  try {
    const forwardedFor = request.headers.get("x-forwarded-for") ?? "local";
    const userAgent = request.headers.get("user-agent") ?? "unknown";
    const rateKey = hashValue(`${forwardedFor}:${userAgent}`);

    if (!canSubmitComment(rateKey)) {
      return jsonError("Too many comments", 429);
    }

    const body = await parseJson(request, commentCreateSchema);
    const comment = await prisma.comment.create({
      data: {
        ...body,
        status: "APPROVED",
        ipHash: hashValue(forwardedFor),
        userAgentHash: hashValue(userAgent)
      }
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Create comment failed", 400);
  }
};
