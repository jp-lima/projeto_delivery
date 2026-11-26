import * as driverService from "../../services/delivery/driver.service.js";
import {
  registerDriverSchema,
  updateAvailabilitySchema,
  historyQuerySchema,
  earningsQuerySchema,
} from "../../validations/driver.schema.js";
import { zodDetails } from "../../utils/httpError.js";

function handleError(res, error) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ error: error.message });
  }
  console.error(error);
  return res.status(500).json({ error: "Erro interno no servidor" });
}

export async function register(req, res) {
  /*
    #swagger.tags = ['Entregadores']
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        vehicle: 'motorcycle',
        license_plate: 'ABC1D23'
      }
    }
  */
  const parsed = registerDriverSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Dados inválidos", details: zodDetails(parsed.error) });
  }

  try {
    const driver = await driverService.registerDriver({
      userId: req.user.id,
      ...parsed.data,
    });
    return res.status(201).json(driver);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function updateAvailability(req, res) {
  /*
    #swagger.tags = ['Entregadores']
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        available: true
      }
    }
  */
  const parsed = updateAvailabilitySchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Dados inválidos", details: zodDetails(parsed.error) });
  }

  try {
    const updated = await driverService.updateAvailability({
      driverId: req.driverId,
      available: parsed.data.available,
    });
    return res.status(200).json(updated);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function listDeliveries(req, res) {
  /* #swagger.tags = ['Entregadores'] */
  try {
    const result = await driverService.listDeliveries({
      driverId: req.driverId,
    });
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function getHistory(req, res) {
  /*
    #swagger.tags = ['Entregadores']
    #swagger.parameters['start_date'] = { in: 'query', type: 'string' }
    #swagger.parameters['end_date'] = { in: 'query', type: 'string' }
    #swagger.parameters['status'] = { in: 'query', type: 'string' }
  */
  const parsed = historyQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Dados inválidos", details: zodDetails(parsed.error) });
  }

  try {
    const result = await driverService.getDeliveryHistory({
      driverId: req.driverId,
      filters: parsed.data,
    });
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function getEarnings(req, res) {
  /*
    #swagger.tags = ['Entregadores']
    #swagger.parameters['period'] = {
      in: 'query',
      type: 'string',
      enum: ['today', 'week', 'month', 'all']
    }
  */
  const parsed = earningsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Dados inválidos", details: zodDetails(parsed.error) });
  }

  try {
    const result = await driverService.getEarnings({
      driverId: req.driverId,
      period: parsed.data.period,
    });
    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}
