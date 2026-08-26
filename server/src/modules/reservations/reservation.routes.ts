import { Router } from "express";
import {
  authenticate,
  authorize,
} from "../../middlewares/auth.js";
import {
  createReservationController,
  getReservationController,
  listReservationsController,
  payReservationController,
} from "./reservation.controller.js";

const router = Router();

router.use(authenticate);
router.use(authorize("CUSTOMER"));

router.post("/", createReservationController);
router.get("/", listReservationsController);
router.get("/:id", getReservationController);
router.post("/:id/pay", payReservationController);

export default router;