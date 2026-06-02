import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/api";

const sanitizeFilename = (filename: string) =>
  filename
    .replace(/[^\w.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "download.jpg";

export const GET = async (request: NextRequest) => {
  const rawUrl = request.nextUrl.searchParams.get("url");
  const rawFilename = request.nextUrl.searchParams.get("filename") ?? "download.jpg";

  if (!rawUrl) {
    return jsonError("Download url is required");
  }

  const targetUrl = rawUrl.startsWith("/")
    ? new URL(rawUrl, request.nextUrl.origin).toString()
    : rawUrl;

  if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
    return jsonError("Unsupported download url");
  }

  const response = await fetch(targetUrl);

  if (!response.ok) {
    return jsonError("Download source is unavailable", 502);
  }

  const contentType = response.headers.get("content-type") ?? "application/octet-stream";
  const bytes = await response.arrayBuffer();

  return new NextResponse(bytes, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${sanitizeFilename(rawFilename)}"`
    }
  });
};
