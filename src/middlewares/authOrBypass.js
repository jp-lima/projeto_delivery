import "dotenv/config";
import { authToken } from "./authToken.js";

// Cliente "João" que já existe no seed do banco (tem endereço e pedido)
const DEFAULT_DEV_USER = {
  id: "49d470e9-2c27-495a-aa65-949605979e51",
  email: "joao@email.com",
  role: "customer",
};

const bypassEnabled =
  process.env.AUTH_BYPASS === "true" && process.env.NODE_ENV !== "production";

if (bypassEnabled) {
  console.warn("⚠️  AUTH_BYPASS ativo: autenticação JWT desativada (somente dev)");
}

/**
 * Em produção (ou sem AUTH_BYPASS=true) é o authToken normal.
 * Com o bypass ligado, ignora o token e injeta um usuário fixo.
 * Para testar como outro usuário, envie o header: x-dev-user-id
 */
export function authOrBypass(req, res, next) {
  if (!bypassEnabled) return authToken(req, res, next);

  const devUserId = req.headers["x-dev-user-id"];

  req.user = devUserId
    ? { ...DEFAULT_DEV_USER, id: String(devUserId) }
    : DEFAULT_DEV_USER;

  next();
}