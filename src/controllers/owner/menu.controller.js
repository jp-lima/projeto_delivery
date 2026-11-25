import * as menuService from "../../services/owner/menu.service.js";
import { createMenuItemSchema } from "../../validations/menu.schema.js";

export async function create(req, res) {
  try {
    const validated = createMenuItemSchema.parse(req.body);

    const menuItem = await menuService.create({
      restaurantId: req.restaurantId,
      ...validated,
    });

    return res.status(201).json(menuItem);
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Dados inválidos", details: error.errors });
    }

    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.error(error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}

export async function getAll(req, res) {
  try {
    const filters = {
      name: req.query.name,
      category_id: req.query.category_id,
      available: req.query.available,
    };

    const result = await menuService.list({
      restaurantId: req.restaurantId,
      filters,
    });

    return res.status(200).json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.error(error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}

export async function delete(req, res) {
  try{
  console.log("Tedte");

}catch(error){
  if(error.statusCode){
    return res.status(error.statusCode).json({error: error.message})
  }

  console.error(error);
  return res.status(error.statusCode).json({error:"Erro interno no servidor"})
}

}

