import { z } from "zod";

export const createMenuItemSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  description: z.string().optional(),
  price: z.number().positive("O preço deve ser maior que zero"),
  available: z.boolean().optional().default(true),
  category_id: z.string().uuid().optional().nullable(),
});
