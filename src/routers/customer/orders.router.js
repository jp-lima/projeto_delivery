import { Router } from "express";
import * as ordersController from "../../controllers/customer/orders.controller.js";

const router = Router();

router.get("/", ordersController.list);
router.post("/", ordersController.create);

export default router;