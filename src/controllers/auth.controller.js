import { z } from "zod";
import {
  createUserService,
  loginUserService,
  registerUserService,
} from "../services/auth.services.js";
import {
  rotateRefreshToken,
  revokeRefreshToken,
} from "../services/refreshToken.service.js";
import {
  setAuthCookies,
  clearAuthCookies,
  REFRESH_COOKIE,
} from "../utils/cookies.js";
import { generateToken } from "../utils/jwt.js";
import { zodDetails } from "../utils/httpError.js";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

const createUserSchema = z.object({
  name: z
    .string()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(100, "Nome muito longo"),

  email: z.string().email("Email inválido"),

  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),

  phone: z
    .string()
    .regex(
      /^\d{10,11}$/,
      "Telefone deve ter 10 ou 11 dígitos (DDD + número, só números)",
    ),

  role: z
    .enum(["customer", "driver", "restaurant_admin"])
    .default("customer"),
});

export async function login(req, res) {
  /*
    #swagger.tags = ['Auth']
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        email: 'joao@email.com',
        password: '123456'
      }
    }
  */

  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res
        .status(400)
        .json({ errors: result.error.flatten().fieldErrors });
    }

    const { data, tokens } = await loginUserService(result.data);
    const csrfToken = setAuthCookies(res, tokens);

    return res.status(200).json({
      token: tokens.accessToken,
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
      },
      csrfToken,
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error("[login] Falha para logar", err);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}

export async function createUser(req, res) {
  const result = createUserSchema.safeParse(req.body);

  /*
     #swagger.tags = ['Auth']
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        name: "João Pedro Lima dos Santos",
        email: 'joao@email.com',
        password: '123456',
        phone: "11999990001",
        role: "customer"
      }
    }
   */

  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten().fieldErrors });
  }

  try {
    const { data, tokens } = await createUserService(result.data);
    const csrfToken = setAuthCookies(res, tokens);
    return res.status(201).json({ data, csrfToken });
  } catch (err) {
    console.error(err);

    if (err.message.includes("Já existe um usuário")) {
      return res.status(409).json({ message: err.message });
    }

    return res.status(500).json({ message: "Erro interno" });
  }
}

// TASK 1 — POST /auth/register
export async function register(req, res) {
  /*
    #swagger.tags = ['Auth']
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        name: "João Silva",
        email: 'joao@email.com',
        phone: "11999999999",
        password: 'senhaSegura123',
        role: "customer"
      }
    }
  */
  const result = createUserSchema.safeParse(req.body);

  if (!result.success) {
    return res
      .status(400)
      .json({ error: "Dados inválidos", details: zodDetails(result.error) });
  }

  try {
    const user = await registerUserService(result.data);
    return res.status(201).json(user);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error("[register] Falha ao cadastrar", err);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}

export async function refresh(req, res) {
  /* #swagger.tags = ['Auth'] */

  const token = req.cookies?.[REFRESH_COOKIE];

  if (!token) {
    return res.status(401).json({ error: "Refresh token ausente" });
  }

  try {
    const { user, refreshToken } = await rotateRefreshToken(token);

    const accessToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const csrfToken = setAuthCookies(res, { accessToken, refreshToken });

    return res.status(200).json({ ok: true, csrfToken });
  } catch (err) {
    clearAuthCookies(res);
    return res.status(401).json({ error: "Sessão expirada" });
  }
}

export async function logout(req, res) {
  /* #swagger.tags = ['Auth'] */

  const token = req.cookies?.[REFRESH_COOKIE];

  if (token) {
    await revokeRefreshToken(token);
  }

  clearAuthCookies(res);

  return res.status(204).send();
}