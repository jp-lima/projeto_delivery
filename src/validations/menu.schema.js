import { z } from "zod";

export const idSchema = z.string().uuid("ID inválido");

export const createMenuItemSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  description: z.string().optional(),
  price: z.number().positive("O preço deve ser maior que zero"),
  available: z.boolean().optional().default(true),
  category_id: z.string().uuid().optional().nullable(),
});

export const updateMenuItemSchema = z.object({
  name: z.string().min(1, "O nome não pode estar vazio").optional(),
  description: z.string().optional().nullable(),
  price: z.number().positive("O preço deve ser maior que zero").optional(),
  available: z.boolean().optional(),
  category_id: z.string().uuid().optional().nullable(),
});
