import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { Prisma } from "../generated/prisma/client.ts";
import { httpError } from "../utils/httpError.js";

const SALT_ROUNDS = 10;
const INVALID_TOKEN_MSG = "Token inválido ou expirado";

// TASK 5 — GET /me
export async function getMe(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  // Token válido, mas usuário não existe mais
  if (!user) throw httpError(401, INVALID_TOKEN_MSG);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    created_at: user.createdAt,
  };
}

// TASK 6 — PUT /me
export async function updateMe(userId, { name, phone, email }) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, phone, ...(email !== undefined && { email }) },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      updated_at: user.updatedAt,
    };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") throw httpError(400, "Email já está em uso");
      if (err.code === "P2025") throw httpError(401, INVALID_TOKEN_MSG);
    }
    throw err;
  }
}

// TASK 7 — PATCH /me/password
export async function changePassword(
  userId,
  { current_password, new_password },
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw httpError(401, INVALID_TOKEN_MSG);

  const matches = await bcrypt.compare(current_password, user.passwordHash);
  if (!matches) throw httpError(400, "Senha atual incorreta");

  const passwordHash = await bcrypt.hash(new_password, SALT_ROUNDS);

  // Troca a senha e invalida os refresh tokens ativos (derruba outras sessões)
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
    prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
}