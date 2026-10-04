import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "music-theory-quiz-secret-key-change-me"
);
const COOKIE_NAME = "mtq_token";

export interface JWTPayload {
  sub: number;
  username: string;
  role: "student" | "teacher";
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload, sub: String(payload.sub) })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyToken(
  token: string
): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return {
      sub: Number(payload.sub),
      username: String(payload.username),
      role: (payload.role as "student" | "teacher") ?? "student",
    };
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAuthCookie() {
  cookies().delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<JWTPayload | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}
