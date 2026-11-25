import { prisma } from "../lib/prisma.js";
import { Prisma } from "../generated/prisma/client.ts";
import { generateToken } from "../utils/jwt.js";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { issueRefreshToken } from "./refreshToken.service.js";
import { httpError } from "../utils/httpError.js";

const SALT_ROUNDS = 10;
const VALID_ROLES = ["customer", "driver", "restaurant_admin"];

export async function createUserService(body) {
  const { name, email, phone, password, role = "customer" } = body;

  if (!VALID_ROLES.includes(role)) {
    throw new Error("Papel de usuário inválido");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const randomId = randomUUID();

    await prisma.user.create({
      data: {
        id: randomId,
        name,
        email,
        phone,
        passwordHash: hashedPassword,
        role,
      },
    });

    const accessToken = generateToken({ id: randomId, email, role });
    const refreshToken = await issueRefreshToken(randomId);

    return {
      data: {
        name,
        email,
        phone,
        role,
      },
      tokens: { accessToken, refreshToken },
    };
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      console.log(err);
      const match = err.message.match(/\(`([^`]+)`\)/);
      const campo = match ? match[1] : "email";
      throw new Error(`Já existe um usuário com esse ${campo}`);
    }
    throw err;
  }
}

// TASK 1 — POST /auth/register (não faz login: só cadastra e devolve o usuário)
export async function registerUserService(body) {
  const { name, email, phone, password, role = "customer" } = body;

  try {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: { id: randomUUID(), name, email, phone, passwordHash, role },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      created_at: user.createdAt,
    };
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      throw httpError(400, "Email já cadastrado");
    }
    throw err;
  }
}

// TASK 2 — usado pelo POST /auth/login
export async function loginUserService(body) {
  const { email, password } = body;

  const responseDataBase = await prisma.user.findUnique({ where: { email } });
  if (!responseDataBase) {
    throw httpError(401, "Email ou senha inválidos");
  }

  const isRightPassword = await bcrypt.compare(
    password,
    responseDataBase.passwordHash,
  );
  if (!isRightPassword) {
    throw httpError(401, "Email ou senha inválidos");
  }

  const accessToken = generateToken({
    id: responseDataBase.id,
    email,
    role: responseDataBase.role,
  });
  const refreshToken = await issueRefreshToken(responseDataBase.id);

  return {
    data: {
      id: responseDataBase.id,
      name: responseDataBase.name,
      email,
      phone: responseDataBase.phone,
      role: responseDataBase.role,
    },
    tokens: { accessToken, refreshToken },
  };
}