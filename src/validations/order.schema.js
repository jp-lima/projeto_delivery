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

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

// Aceita "2026-11-17" ou ISO completo. Em end_date, uma data sem hora
// inclui o dia inteiro (até 23:59:59.999 UTC).
const dateParam = (isEnd) =>
  z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), "Data inválida")
    .transform((v) =>
      isEnd && DATE_ONLY.test(v) ? new Date(`${v}T23:59:59.999Z`) : new Date(v),
    )
    .optional();

// GET /orders (query params)
export const listOrdersQuerySchema = z
  .object({
    status: z
      .string()
      .transform((v) => v.toUpperCase())
      .pipe(z.enum(ORDER_STATUSES, "Status inválido"))
      .optional(),
    start_date: dateParam(false),
    end_date: dateParam(true),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  })
  .refine(
    (d) => !(d.start_date && d.end_date && d.start_date > d.end_date),
    { message: "start_date deve ser anterior a end_date", path: ["start_date"] },
  );

// POST /orders
export const createOrderSchema = z.object({
  restaurant_id: z.string().uuid("restaurant_id inválido"),
  address_id: z.string().uuid("address_id inválido"),
  items: z
    .array(
      z.object({
        menu_item_id: z.string().uuid("menu_item_id inválido"),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1, "O pedido precisa ter ao menos um item"),
  payment_method: z.enum(["credit_card", "pix", "cash"]),
  notes: z.string().max(500).optional().nullable(),
  discount: z.number().min(0, "Desconto inválido").optional().default(0),
});