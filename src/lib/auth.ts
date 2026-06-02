import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

const cookieName = "admin_session";
const encoder = new TextEncoder();

export type AdminSession = {
  id: string;
  email: string;
  name: string;
};

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters");
  }

  return encoder.encode(secret);
};

export const createAdminToken = async (session: AdminSession) =>
  new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());

export const verifyAdminToken = async (token: string): Promise<AdminSession | null> => {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());

    if (
      typeof payload.id !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string"
    ) {
      return null;
    }

    return {
      id: payload.id,
      email: payload.email,
      name: payload.name
    };
  } catch {
    return null;
  }
};

export const getRequestAdmin = async (request: NextRequest) => {
  const token = request.cookies.get(cookieName)?.value;
  return token ? verifyAdminToken(token) : null;
};

export const getPageAdmin = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  return token ? verifyAdminToken(token) : null;
};

export const adminCookieName = cookieName;
