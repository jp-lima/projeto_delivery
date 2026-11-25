import "dotenv/config";

export function adminAuthToken(req, res, next) {
  const role = req.user.role;

  if (role !== "admin") {
    return res.status(403).json("Acesso nao autorizado");
  } else {
    next();
  }
}
