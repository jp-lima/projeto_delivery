import { Router } from "express";
import * as categoriesController from "../controllers/categories.controller.js";
import * as restaurantsController from "../controllers/restaurants.controller.js";

const router = Router();

router.get("/categories", categoriesController.getAll);
router.get("/restaurants", restaurantsController.getAll);
router.get("/restaurants/:id", restaurantsController.getById);

export default router;
