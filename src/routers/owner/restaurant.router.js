import { Router } from "express";
import * as restaurantController from "../../controllers/owner/restaurant.controller.js";

const router = Router();

router.post("/", restaurantController.create);

export default router;
