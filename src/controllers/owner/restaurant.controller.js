import * as restaurantService from "../../services/owner/restaurant.service.js";
import { createRestaurantSchema } from "../../validations/restaurants.schema.js";

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
