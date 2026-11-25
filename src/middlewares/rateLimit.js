import rateLimit from "express-rate-limit";


export const authIpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    error: "Muitas tentativas de login. Tente novamente em instantes.",
  },
});

export const authAccountLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.body.email,
  message: {
    error: "Muitas tentativas para este usuário. Tente novamente mais tarde.",
  },
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  message: {
    error: "Muitas requisições. Tente novamente em instantes.",
  },
});