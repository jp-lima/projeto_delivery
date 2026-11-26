import { z } from "zod";

const ORDER_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "REJECTED",
  "CANCELLED",
];

const dateStringSchema = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Data inválida",
  });

export const registerDriverSchema = z.object({
  vehicle: z
    .string({ error: "O veículo é obrigatório" })
    .trim()
    .min(1, "O veículo é obrigatório"),
  license_plate: z
    .string({ error: "A placa é obrigatória" })
    .trim()
    .min(1, "A placa é obrigatória"),
});

export const updateAvailabilitySchema = z.object({
  available: z.boolean({ error: "O campo available deve ser booleano" }),
});

export const historyQuerySchema = z
  .object({
    start_date: dateStringSchema.optional(),
    end_date: dateStringSchema.optional(),
    status: z.enum(ORDER_STATUSES).optional(),
  })
  .refine(
    (data) => {
      if (!data.start_date || !data.end_date) return true;
      return new Date(data.start_date) <= new Date(data.end_date);
    },
    { message: "start_date não pode ser maior que end_date" },
  );

export const earningsQuerySchema = z.object({
  period: z.enum(["today", "week", "month", "all"]).default("month"),
});
