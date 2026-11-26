import { z } from "zod";

export const createRestaurantSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  cnpj: z.string().min(1, "O CNPJ é obrigatório"),
  phone: z.string().min(1, "O telefone é obrigatório"),
  category_id: z.string().uuid().optional().nullable(),
  delivery_fee: z.number().nonnegative().optional().default(0),
  opening_hours: z.any().optional().nullable(),
  address: z.object({
    street: z.string().min(1),
    number: z.string().min(1),
    neighborhood: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    cep: z.string().min(1),
    complement: z.string().optional().nullable(),
  }),
});

export const updateRestaurantSchema = z.object({
  name: z.string().min(1).optional(),
  cnpj: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  category_id: z.string().uuid().optional().nullable(),
  delivery_fee: z.number().nonnegative().optional(),
  opening_hours: z.any().optional().nullable(),
  address: z
    .object({
      street: z.string().min(1).optional(),
      number: z.string().min(1).optional(),
      neighborhood: z.string().min(1).optional(),
      city: z.string().min(1).optional(),
      state: z.string().min(1).optional(),
      cep: z.string().min(1).optional(),
      complement: z.string().optional().nullable(),
    })
    .optional(),
});
