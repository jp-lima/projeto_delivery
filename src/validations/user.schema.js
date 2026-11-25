import { z } from "zod";

const phoneSchema = z
  .string()
  .regex(
    /^\d{10,11}$/,
    "Telefone deve ter 10 ou 11 dígitos (DDD + número, só números)",
  );

// PUT /me
export const updateMeSchema = z.object({
  name: z
    .string()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(100, "Nome muito longo"),
  phone: phoneSchema,
  // opcional: se enviado, é validado como único (erro 400 "Email já está em uso")
  email: z.string().email("Email inválido").optional(),
});

// PATCH /me/password
export const changePasswordSchema = z.object({
  current_password: z.string().min(1, "A senha atual é obrigatória"),
  new_password: z
    .string()
    .min(6, "A nova senha deve ter no mínimo 6 caracteres"),
});