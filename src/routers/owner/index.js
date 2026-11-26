import { Router } from "express";
import menuRouter from "./menu.router.js";
import restaurantRouter from "./restaurant.router.js";
import { restaurantAdminAuth } from "../../middlewares/restaurantAdminAuth.js";

const router = Router();

router.use(restaurantAdminAuth);
router.use("/menu", menuRouter);
router.use("/register-restaurant", restaurantRouter);

export default router;
