import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.js";
import {
  getTicketController,
  getTicketByShareTokenController,
  validateTicketController,
} from "./ticket.controller.js";


const router = Router();

router.get(
  "/share/:shareToken",
  getTicketByShareTokenController,
);

router.get(
  "/:id",
  authenticate,
  getTicketController,
);

router.post(
  "/:id/validate",
  authenticate,
  authorize("GATE"),
  validateTicketController,
);

export default router;