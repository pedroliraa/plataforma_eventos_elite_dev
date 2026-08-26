import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import {
  getTicketController,
  getTicketByShareTokenController,
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

export default router;