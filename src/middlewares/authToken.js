import jwt from "jsonwebtoken";
import { ACCESS_COOKIE } from "../utils/cookies.js";

export function authToken(req, res, next) {
  const token =
    req.cookies?.[ACCESS_COOKIE] ?? req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({
        error: "Token ausente. Envie no header: Authorization: Bearer <token>",
      });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}
