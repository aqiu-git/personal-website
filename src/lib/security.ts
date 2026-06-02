import type { NextRequest } from "next/server";

export const isSameOriginRequest = (request: NextRequest) => {
  const origin = request.headers.get("origin");

  if (!origin) {
    return true;
  }

  const host = request.headers.get("host");

  if (!host) {
    return false;
  }

  return new URL(origin).host === host;
};
