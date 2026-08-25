import { Router } from "express";
import {
  authenticate,
  authorize,
} from "../../middlewares/auth.js";
import {
  createEventController,
  deleteEventController,
  getEventController,
  listEventsController,
  updateEventController,
} from "./event.controller.js";

const router = Router();

router.get("/", listEventsController);
router.get("/:id", getEventController);

router.post(
  "/",
  authenticate,
  authorize("ORGANIZER"),
  createEventController,
);

router.put(
  "/:id",
  authenticate,
  authorize("ORGANIZER"),
  updateEventController,
);

router.delete(
  "/:id",
  authenticate,
  authorize("ORGANIZER"),
  deleteEventController,
);

export default router;