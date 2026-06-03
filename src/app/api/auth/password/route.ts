import { compare, hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { getRequestAdmin } from "@/lib/auth";
import { jsonError, parseJson } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { isSameOriginRequest } from "@/lib/security";
import { passwordChangeSchema } from "@/lib/validation";

export const PATCH = async (request: NextRequest) => {
  if (!isSameOriginRequest(request)) {
    return jsonError("Invalid origin", 403);
  }

  const session = await getRequestAdmin(request);

  if (!session) {
    return jsonError("Unauthorized", 401);
  }

  try {
    const body = await parseJson(request, passwordChangeSchema);
    const admin = await prisma.admin.findFirst({
      where: {
        id: session.id,
        deletedAt: null
      }
    });

    if (!admin || !(await compare(body.currentPassword, admin.passwordHash))) {
      return jsonError("Current password is incorrect", 401);
    }

    if (await compare(body.newPassword, admin.passwordHash)) {
      return jsonError("New password must be different", 400);
    }

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        passwordHash: await hash(body.newPassword, 12)
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Change password failed", 400);
  }
};
