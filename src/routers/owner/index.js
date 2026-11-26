import { Router } from "express";
import menuRouter from "./menu.router.js";
import restaurantRouter from "./restaurant.router.js";
import * as restaurantController from "../../controllers/owner/restaurant.controller.js";
import { restaurantAdminAuth } from "../../middlewares/restaurantAdminAuth.js";

const router = Router();

router.use(restaurantAdminAuth);
router.use("/menu", menuRouter);
router.use("/register-restaurant", restaurantRouter);
router.patch("/restaurants/:id/status", restaurantController.updateStatus);
router.patch("/restaurants/:id", restaurantController.update);

export default router;
