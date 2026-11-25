import * as userService from "../services/user.service.js";
import {
  updateMeSchema,
  changePasswordSchema,
} from "../validations/user.schema.js";
import { zodDetails } from "../utils/httpError.js";

function handleError(res, error) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ error: error.message });
  }
  console.error(error);
  return res.status(500).json({ error: "Erro interno no servidor" });
}

export async function getMe(req, res) {
  /* #swagger.tags = ['Usuário'] */
  try {
    const user = await userService.getMe(req.user.id);
    return res.status(200).json(user);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function updateMe(req, res) {
  /* #swagger.tags = ['Usuário'] */
  const parsed = updateMeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Dados inválidos", details: zodDetails(parsed.error) });
  }

  try {
    const user = await userService.updateMe(req.user.id, parsed.data);
    return res.status(200).json(user);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function changePassword(req, res) {
  /* #swagger.tags = ['Usuário'] */
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Dados inválidos", details: zodDetails(parsed.error) });
  }

  try {
    await userService.changePassword(req.user.id, parsed.data);
    return res.status(204).send();
  } catch (error) {
    return handleError(res, error);
  }
}