import { Router } from "express";
import * as driverController from "../../controllers/delivery/driver.controller.js";
import { requireDriverProfile } from "../../middlewares/driverAuth.js";

const router = Router();

router.post("/register", driverController.register);
router.patch("/availability", requireDriverProfile, driverController.updateAvailability);
router.get("/deliveries", requireDriverProfile, driverController.listDeliveries);
router.get("/history", requireDriverProfile, driverController.getHistory);
router.get("/earnings", requireDriverProfile, driverController.getEarnings);

export default router;
