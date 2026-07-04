import { cookies } from "next/headers";
import { prisma } from "./db";
import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "chipomugzie-farm-secret-change-in-production"
);

export async function createToken(userId: string) {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
    });
    return user;
  } catch {
    return null;
  }
}

export function isPlatformAdmin(user: { role: string; email: string } | null) {
  if (!user) return false;
  const adminEmail = (process.env.PLATFORM_ADMIN_EMAIL || "buhle0888@gmail.com").toLowerCase();
  return user.role === "platform_admin" || user.email.toLowerCase() === adminEmail;
}

export function hasActivePro(user: { plan: string; planExpiresAt: Date | null } | null) {
  if (!user) return false;
  if (user.plan !== "pro") return false;
  if (!user.planExpiresAt) return true;
  return user.planExpiresAt.getTime() > Date.now();
}

export async function requireAuth() {
  const user = await getSession();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
