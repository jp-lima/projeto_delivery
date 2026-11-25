import * as categoriesService from "../services/categories.service.js";

export async function getAll(req, res) {
  /*
    #swagger.tags = ['Categorias']
  */
  try {
    const result = await categoriesService.list();
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}
