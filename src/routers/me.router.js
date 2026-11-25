import { Router } from "express";
import * as meController from "../controllers/me.controller.js";

const router = Router();

router.get("/", meController.getMe);
router.put("/", meController.updateMe);
router.patch("/password", meController.changePassword);

export default router;