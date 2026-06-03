import { compare } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { adminCookieName, createAdminToken } from "@/lib/auth";
import { jsonError, parseJson } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { isSameOriginRequest } from "@/lib/security";
import { loginSchema } from "@/lib/validation";

export const POST = async (request: NextRequest) => {
  if (!isSameOriginRequest(request)) {
    return jsonError("Invalid origin", 403);
  }

  try {
    const body = await parseJson(request, loginSchema);
    const admin = await prisma.admin.findFirst({
      where: {
        email: body.email,
        deletedAt: null
      }
    });

    if (!admin || !(await compare(body.password, admin.passwordHash))) {
      return jsonError("Invalid credentials", 401);
    }

    const token = await createAdminToken({
      id: admin.id,
      email: admin.email,
      name: admin.name
    });
    const response = NextResponse.json({ ok: true });
    const isHttps =
      request.nextUrl.protocol === "https:" || request.headers.get("x-forwarded-proto") === "https";

    response.cookies.set(adminCookieName, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: isHttps,
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Login failed", 400);
  }
};
