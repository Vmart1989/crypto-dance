import { createHmac } from "node:crypto";
import { prisma } from "@/lib/prisma";

const allowedCategories = new Set(["account", "auth", "trading", "wallet", "admin"]);

function requestIpHash(request) {
  if (!request) return null;
  const ip = (request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "")
    .split(",")[0]
    .trim();
  if (!ip) return null;
  const secret = process.env.JWT_SECRET || "development-only-activity-key";
  return createHmac("sha256", secret).update(ip).digest("hex").slice(0, 24);
}

function cleanMetadata(metadata) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return undefined;
  return Object.fromEntries(
    Object.entries(metadata)
      .slice(0, 12)
      .map(([key, value]) => [
        String(key).slice(0, 40),
        typeof value === "string" ? value.slice(0, 240) : value,
      ])
  );
}

function optionalId(value) {
  if (value === null || value === undefined || value === "") return null;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function recordActivity({
  request,
  event,
  category,
  summary,
  userId = null,
  actorUserId = null,
  metadata,
}) {
  try {
    if (!event || !summary || !allowedCategories.has(category)) return null;
    return await prisma.activityLog.create({
      data: {
        event: String(event).slice(0, 80),
        category,
        summary: String(summary).slice(0, 300),
        userId: optionalId(userId),
        actorUserId: optionalId(actorUserId),
        ipHash: requestIpHash(request),
        metadata: cleanMetadata(metadata),
      },
    });
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? String(error.code) : "UNKNOWN";
    console.error(`Activity logging failed (${code})`);
    return null;
  }
}
