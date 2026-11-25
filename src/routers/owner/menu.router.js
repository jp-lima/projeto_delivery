import { Router } from "express";
import * as menuController from "../../controllers/owner/menu.controller.js";

const router = Router();

router.post("/", menuController.create);
router.get("/", menuController.getAll);
router.patch("/:id", menuController.update);
router.delete("/:id", menuController.remove);

export default router;
