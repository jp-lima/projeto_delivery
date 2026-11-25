import "dotenv/config";

// TODO: reativar validação real quando o fluxo de autenticação estiver pronto
// export function restaurantAdminAuth(req, res, next) {
//   const role = req.user?.role;
//
//   if (role !== "restaurant_admin") {
//     return res.status(403).json({ error: "Acesso restrito a administradores de restaurantes" });
//   }
//
//   next();
// }

export function restaurantAdminAuth(req, res, next) {
  req.user = req.user ?? {
    id: "ee192f4a-ec8a-4330-b78e-f0e83b2cf977",
    role: "restaurant_admin",
    email: "maria@restaurante.com",
  };

  req.restaurantId = "33f9ae6e-d111-4d73-9382-4cc45c39fca6";

  next();
}
