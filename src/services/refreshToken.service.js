import { prisma } from "../lib/prisma.js";
import { randomBytes, createHash, randomUUID } from "crypto";

const REFRESH_TTL_DAYS = 30;

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function generateToken() {
  return randomBytes(64).toString("hex");
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export async function issueRefreshToken(userId) {
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = addDays(new Date(), REFRESH_TTL_DAYS);

  await prisma.refreshToken.create({
    data: {
      id: randomUUID(),
      tokenHash,
      userId,
      expiresAt,
    },
  });

  return token;
}

export async function rotateRefreshToken(token) {
  const tokenHash = hashToken(token);

  const current = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!current || current.revokedAt || current.expiresAt < new Date()) {
    throw new Error("Refresh token inválido ou expirado");
  }

  const newToken = generateToken();
  const newTokenHash = hashToken(newToken);
  const expiresAt = addDays(new Date(), REFRESH_TTL_DAYS);

  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: current.id },
      data: { revokedAt: new Date() },
    }),
    prisma.refreshToken.create({
      data: {
        id: randomUUID(),
        tokenHash: newTokenHash,
        userId: current.userId,
        expiresAt,
      },
    }),
  ]);

  return { user: current.user, refreshToken: newToken };
}

export async function revokeRefreshToken(token) {
  const tokenHash = hashToken(token);

  await prisma.refreshToken.updateMany({
    where: { tokenHash },
    data: { revokedAt: new Date() },
  });
}
