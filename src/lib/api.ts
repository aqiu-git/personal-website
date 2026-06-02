import { NextResponse } from "next/server";
import { ZodError } from "zod";

export const jsonError = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });

export const parseJson = async <T>(request: Request, parser: { parse: (value: unknown) => T }) => {
  try {
    return parser.parse(await request.json());
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error(error.issues[0]?.message ?? "Invalid request body");
    }

    throw error;
  }
};
