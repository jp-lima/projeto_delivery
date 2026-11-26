import * as restaurantService from "../../services/owner/restaurant.service.js";
import {
  createRestaurantSchema,
  updateRestaurantSchema,
} from "../../validations/restaurants.schema.js";

export async function updateStatus(req, res) {
  /*
    #swagger.tags = ['Restaurantes']
  */
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    const result = await restaurantService.updateStatus(id, status);
    return res.status(200).json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.error(error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}

export async function create(req, res) {
  /*
    #swagger.tags = ['Restaurantes']
  */
  try {
    const validated = createRestaurantSchema.parse(req.body);

    const restaurant = await restaurantService.create({
      adminId: req.user.id,
      ...validated,
    });

    return res.status(201).json(restaurant);
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

export async function update(req, res) {
  /*
    #swagger.tags = ['Restaurantes']
  */
  try {
    const { id } = req.params;
    const validated = updateRestaurantSchema.parse(req.body);
    const result = await restaurantService.update({ id, ...validated });
    return res.status(200).json(result);
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
