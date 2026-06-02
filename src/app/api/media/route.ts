import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getRequestAdmin } from "@/lib/auth";
import { jsonError, parseJson } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { isSameOriginRequest } from "@/lib/security";
import { mediaCreateSchema } from "@/lib/validation";

const uploadDir = join(process.cwd(), "public", "uploads");
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const allowedVideoTypes = new Set(["video/mp4", "video/webm"]);

export const runtime = "nodejs";

const extensionFor = (file: File) => {
  if (file.type === "image/jpeg") {
    return ".jpg";
  }

  if (file.type === "image/png") {
    return ".png";
  }

  if (file.type === "image/webp") {
    return ".webp";
  }

  if (file.type === "image/gif") {
    return ".gif";
  }

  if (file.type === "video/mp4") {
    return ".mp4";
  }

  return ".webm";
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
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");

      if (!(file instanceof File)) {
        return jsonError("File is required");
      }

      const isImage = allowedImageTypes.has(file.type);
      const isVideo = allowedVideoTypes.has(file.type);

      if (!isImage && !isVideo) {
        return jsonError("Unsupported media type");
      }

      await mkdir(uploadDir, { recursive: true });
      const filename = `${randomUUID()}${extensionFor(file)}`;
      const storagePath = join(uploadDir, filename);
      const bytes = Buffer.from(await file.arrayBuffer());
      await writeFile(storagePath, bytes);

      const media = await prisma.media.create({
        data: {
          url: `/uploads/${filename}`,
          type: isImage ? "IMAGE" : "VIDEO",
          mimeType: file.type,
          alt: formData.get("alt")?.toString(),
          caption: formData.get("caption")?.toString(),
          storageKey: filename
        }
      });

      return NextResponse.json({ media }, { status: 201 });
    }

    const body = await parseJson(request, mediaCreateSchema);
    const media = await prisma.media.create({ data: body });

    return NextResponse.json({ media }, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Create media failed", 400);
  }
};
