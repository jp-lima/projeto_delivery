import { prisma } from "../lib/prisma.js";

export function driverRoleAuth(req, res, next) {
  const role = req.user?.role;

  if (role !== "driver") {
    return res
      .status(403)
      .json({ error: "Acesso restrito a entregadores" });
  }

  next();
}

export async function requireDriverProfile(req, res, next) {
  try {
    const driver = await prisma.deliveryDriver.findUnique({
      where: { userId: req.user.id },
    });

    if (!driver) {
      return res
        .status(404)
        .json({ error: "Cadastro de entregador não encontrado" });
    }

    req.driver = driver;
    req.driverId = driver.id;
    next();
  } catch (error) {
    console.error("[requireDriverProfile] Erro ao buscar entregador:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}
