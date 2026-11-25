import * as restaurantsService from "../services/restaurants.service.js";

export async function getAll(req, res) {
  /*
    #swagger.tags = ['Restaurantes']
  */
  try {
    const { name, category_id, status, page, limit } = req.query;
    const result = await restaurantsService.list({
      name,
      category_id,
      status,
      page,
      limit,
    });
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}

export async function getById(req, res) {
  /*
    #swagger.tags = ['Restaurantes']
  */
  try {
    const { id } = req.params;
    const result = await restaurantsService.getById(id);
    return res.status(200).json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.error(error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}
