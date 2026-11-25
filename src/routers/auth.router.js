import { Router } from "express";
import {
  login,
  createUser,
  register,
  refresh,
  logout,
} from "../controllers/auth.controller.js";
import { authIpLimiter, authAccountLimiter } from "../middlewares/rateLimit.js";
import { authToken } from "../middlewares/authToken.js";

const router = Router();

router.post("/login", authIpLimiter, authAccountLimiter, login);
router.post("/register", authIpLimiter, authAccountLimiter, register);
router.post("/create", authIpLimiter, authAccountLimiter, createUser);
router.post("/refresh", authIpLimiter, authAccountLimiter, refresh);
router.post("/logout", authToken, logout);

export default router;