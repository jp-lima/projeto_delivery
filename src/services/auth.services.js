import { prisma } from "../lib/prisma.js";
import { Prisma } from "../generated/prisma/client.ts";
import { generateToken } from "../utils/jwt.js";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { issueRefreshToken } from "./refreshToken.service.js";

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

export async function loginUserService(body) {
  const { email, password } = body;

  try {
    const responseDataBase = await prisma.user.findUnique({ where: { email } });
    if (!responseDataBase) {
      throw new Error("email ou senha invalido");
    }

    const isRightPassword = await bcrypt.compare(
      password,
      responseDataBase.passwordHash,
    );
    if (!isRightPassword) {
      throw new Error("email ou senha invalido");
    }

    const accessToken = generateToken({
      id: responseDataBase.id,
      email,
      role: responseDataBase.role,
    });
    const refreshToken = await issueRefreshToken(responseDataBase.id);

    return {
      data: {
        name: responseDataBase.name,
        email,
        phone: responseDataBase.phone,
        role: responseDataBase.role,
      },
      tokens: { accessToken, refreshToken },
    };
  } catch (err) {
    throw err;
  }
}
