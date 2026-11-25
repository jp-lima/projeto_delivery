import * as ordersService from "../../services/customer/orders.service.js";
import {
  listOrdersQuerySchema,
  createOrderSchema,
} from "../../validations/order.schema.js";
import { zodDetails } from "../../utils/httpError.js";

function handleError(res, error) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ error: error.message });
  }
  console.error(error);
  return res.status(500).json({ error: "Erro interno no servidor" });
}

export async function list(req, res) {
  /* #swagger.tags = ['Pedidos'] */
  const parsed = listOrdersQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Parâmetros inválidos",
      details: zodDetails(parsed.error),
    });
  }

  try {
    const result = await ordersService.list({
      customerId: req.user.id,
      filters: parsed.data,
    });
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function create(req, res) {
  /* #swagger.tags = ['Pedidos'] */
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Itens inválidos ou restaurante fechado",
      details: zodDetails(parsed.error),
    });
  }

  try {
    const order = await ordersService.create({
      customerId: req.user.id,
      data: parsed.data,
    });
    return res.status(201).json(order);
  } catch (error) {
    return handleError(res, error);
  }
}