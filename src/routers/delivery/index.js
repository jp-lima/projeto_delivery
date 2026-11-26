import { Router } from "express";
import driverRouter from "./driver.router.js";
import { driverRoleAuth } from "../../middlewares/driverAuth.js";

const router = Router();

router.use(driverRoleAuth);
router.use("/", driverRouter);

export default router;
