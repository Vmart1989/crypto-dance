import { createHash, createHmac, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

export const SESSION_TTL_MS = 60 * 60 * 1000;
export const SESSION_COOKIE = process.env.NODE_ENV === "production" ? "__Host-cd_session" : "cd_session";
const THROTTLE_WINDOW_MS = 15 * 60 * 1000;
const MAX_AUTH_FAILURES = 5;
const DUMMY_BCRYPT_HASH = "$2b$12$wJ1fTT1q7jmmHFlbA5yT9ujUwI3VPHkzTz0uDeUVw6x88vP4u0I/a";

const commonPasswords = new Set([
  "123456", "12345678", "123456789", "password", "password1", "qwerty",
  "qwerty123", "admin", "letmein", "welcome", "iloveyou", "abc123",
  "monkey", "dragon", "football", "login", "princess", "sunshine",
  "passw0rd", "000000", "111111", "654321", "1q2w3e4r", "trustno1",
]);

export function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function isValidEmail(email) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function passwordErrors(password) {
  const errors = [];
  if (password.length < 8) errors.push("Use at least 8 characters for your password.");
  if (Buffer.byteLength(password, "utf8") > 72) errors.push("Password must be at most 72 UTF-8 bytes.");
  if (commonPasswords.has(password.toLowerCase())) errors.push("Choose a less common password.");
  return errors;
}

export function validateRegistrationInput(input) {
  const email = normalizeEmail(input?.email);
  const password = typeof input?.password === "string" ? input.password : "";
  const name = typeof input?.name === "string" ? input.name.trim() : "";
  const errors = isValidEmail(email) ? [] : ["A valid email is required."];
  errors.push(...passwordErrors(password));
  if (name.length < 2 || name.length > 50) errors.push("Name must contain 2 to 50 characters.");
  return { valid: errors.length === 0, errors, email, password, name };
}

export function validateLoginInput(input) {
  const email = normalizeEmail(input?.email);
  const password = typeof input?.password === "string" ? input.password : "";
  return {
    valid: Boolean(email && email.length <= 254 && password && Buffer.byteLength(password, "utf8") <= 72),
    email,
    password,
  };
}

export function getDummyPasswordHash() {
  return DUMMY_BCRYPT_HASH;
}

export async function isBreachedPassword(password) {
  const digest = createHash("sha1").update(password, "utf8").digest("hex").toUpperCase();
  const prefix = digest.slice(0, 5);
  const suffix = digest.slice(5);
  const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
    headers: { "Add-Padding": "true", "User-Agent": "CryptoDance-password-check" },
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error("Password safety service unavailable");
  const body = await response.text();
  return body.split("\n").some((line) => line.split(":")[0].trim() === suffix);
}

export function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId, expectedPasswordHash) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const data = { tokenHash: hashToken(token), userId, expiresAt };
  if (expectedPasswordHash === undefined) {
    await prisma.session.create({ data });
  } else {
    const created = await prisma.$transaction(async (tx) => {
      // Serialize session creation with password changes after bcrypt has completed.
      const [user] = await tx.$queryRaw`SELECT "password" FROM "User" WHERE "id" = ${userId} FOR SHARE`;
      if (user?.password !== expectedPasswordHash) return false;
      await tx.session.create({ data });
      return true;
    });
    if (!created) return null;
  }
  return { token, expiresAt };
}

export function setSessionCookie(response, token, expiresAt) {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
    priority: "high",
  });
}

export function clearSessionCookie(response) {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSession(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return prisma.session.findFirst({
    where: { tokenHash: hashToken(token), revokedAt: null, expiresAt: { gt: new Date() } },
    include: { user: true },
  });
}

export async function revokeSession(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return;
  await prisma.session.updateMany({
    where: { tokenHash: hashToken(token), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function requireUser(request) {
  const session = await getSession(request);
  return session?.user ? { session, user: session.user } : null;
}

export async function requireAdmin(request) {
  const auth = await requireUser(request);
  return auth?.user.role === "admin" ? auth : null;
}

export function isSameOrigin(request) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return true;
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && !["same-origin", "same-site", "none"].includes(fetchSite)) return false;
  const origin = request.headers.get("origin");
  if (!origin) return process.env.NODE_ENV !== "production";
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export function getClientIp(request) {
  return (request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown")
    .split(",")[0]
    .trim();
}

function throttleKey(scope, value) {
  const secret = process.env.JWT_SECRET || "development-only-throttle-key";
  return `${scope}:${createHmac("sha256", secret).update(value).digest("hex")}`;
}

export function loginThrottleKeys(request, email) {
  return [throttleKey("login-ip", getClientIp(request)), throttleKey("login-account", email || "invalid")];
}

export function registrationThrottleKeys(request, email) {
  return [throttleKey("register-ip", getClientIp(request)), throttleKey("register-account", email || "invalid")];
}

export function passwordResetThrottleKeys(request, email) {
  return [throttleKey("reset-ip", getClientIp(request)), throttleKey("reset-account", email)];
}

export async function isRateLimited(keys) {
  const now = new Date();
  const records = await prisma.authThrottle.findMany({ where: { key: { in: keys } } });
  return records.some((record) => record.blockedUntil && record.blockedUntil > now);
}

export async function recordAuthAttempt(keys, { failed = true } = {}) {
  const now = new Date();
  await Promise.all(keys.map(async (key) => {
    const current = await prisma.authThrottle.findUnique({ where: { key } });
    const expired = !current || current.resetAt <= now;
    const attempts = expired ? 1 : current.attempts + 1;
    const blockedUntil = failed && attempts >= MAX_AUTH_FAILURES
      ? new Date(now.getTime() + THROTTLE_WINDOW_MS * Math.min(4, attempts - MAX_AUTH_FAILURES + 1))
      : current?.blockedUntil && current.blockedUntil > now ? current.blockedUntil : null;
    await prisma.authThrottle.upsert({
      where: { key },
      create: { key, attempts, resetAt: new Date(now.getTime() + THROTTLE_WINDOW_MS), blockedUntil },
      update: { attempts, resetAt: expired ? new Date(now.getTime() + THROTTLE_WINDOW_MS) : current.resetAt, blockedUntil },
    });
  }));
}

export async function clearAuthAttempts(keys) {
  await prisma.authThrottle.deleteMany({ where: { key: { in: keys } } });
}

export function createVerificationToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) };
}

export function verificationTokenHash(token) {
  return hashToken(token);
}
