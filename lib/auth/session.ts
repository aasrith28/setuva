import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export interface SessionPayload {
  userId: string;
  email: string;
  role: "user" | "content_reviewer" | "publisher" | "admin";
  name: string;
}

const COOKIE_NAME = "setuva_session";
const LEGACY_COOKIE_NAME = "applyright_session";
const JWT_SECRET = process.env.JWT_SECRET || "development-insecure-secret-key-at-least-32-chars-long";

function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(JWT_SECRET);
}

/**
 * Hash a password securely with bcrypt salt rounds = 12
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

/**
 * Verify a plaintext password against a stored bcrypt hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Creates and signs an encrypted/signed JWT session token
 */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

/**
 * Verifies a JWT token and returns the payload if valid
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });

    if (!payload.userId || !payload.email || !payload.role) {
      return null;
    }

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as SessionPayload["role"],
      name: (payload.name as string) || "",
    };
  } catch {
    return null;
  }
}

/**
 * Sets the session cookie on Next.js response headers or cookies()
 */
export function setSessionCookie(token: string): { name: string; value: string; options: object } {
  return {
    name: COOKIE_NAME,
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    },
  };
}

/**
 * Clears the session cookie
 */
export function clearSessionCookie(): { name: string; value: string; options: object } {
  return {
    name: COOKIE_NAME,
    value: "",
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 0,
    },
  };
}

/**
 * Retrieves the current session from incoming NextRequest or cookies()
 */
export async function getSession(req?: NextRequest): Promise<SessionPayload | null> {
  let token: string | undefined;

  if (req) {
    const cookie = req.cookies.get(COOKIE_NAME) || req.cookies.get(LEGACY_COOKIE_NAME);
    token = cookie?.value;
    if (!token) {
      const authHeader = req.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }
  } else {
    try {
      const cookieStore = cookies();
      token = cookieStore.get(COOKIE_NAME)?.value || cookieStore.get(LEGACY_COOKIE_NAME)?.value;
    } catch {
      return null;
    }
  }

  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Helper to require authentication on API Route Handlers
 */
export async function requireAuth(req: NextRequest): Promise<SessionPayload> {
  const session = await getSession(req);
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

/**
 * Helper to require specific roles on API Route Handlers
 */
export async function requireRole(
  req: NextRequest,
  allowedRoles: Array<SessionPayload["role"]>
): Promise<SessionPayload> {
  const session = await requireAuth(req);
  if (!allowedRoles.includes(session.role)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}
