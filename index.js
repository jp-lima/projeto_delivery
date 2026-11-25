import express from "express";
import authRouter from "./src/routers/auth.router.js";
import { apiKeyAuth } from "./src/middlewares/apiKeyAuth.js";
import { authToken } from "./src/middlewares/authToken.js";
import {
  authIpLimiter,
  authAccountLimiter,
  apiLimiter,
} from "./src/middlewares/rateLimit.js";
import { readFileSync } from "fs";
import helmet from "helmet";
import cors from "cors";
import publicRouters from "./src/routers/public.router.js";
import ownerRouters from "./src/routers/owner/index.js";

import cookieParser from "cookie-parser";
const swaggerFile = JSON.parse(readFileSync("./swagger-output.json", "utf-8"));

const app = express();
app.use(helmet());
app.use(
  cors({
    origin: ["https://seu-frontend.vercel.app", "http://localhost:5173"],
    credentials: true,
  }),
);
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  }),
);
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

app.use("/auth", authRouter);
app.use("/api", apiLimiter, apiKeyAuth, publicRouters);
// TODO: reativar authToken quando o fluxo de autenticação estiver pronto
// app.use("/api/owner", apiLimiter, authToken, ownerRouters);
app.use("/api/owner", apiLimiter, ownerRouters);

app.listen(3000, () => console.log("Rodando na porta 3000"));
