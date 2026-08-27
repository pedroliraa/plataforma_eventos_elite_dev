import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
import { errorHandler } from "./middlewares/error-handle.js";
import eventRoutes from "./modules/events/event.routes.js";
import reservationRoutes from "./modules/reservations/reservation.routes.js";
import ticketRoutes from "./modules/tickets/ticket.routes.js";


const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "Elite Events and Tickets API is running",
  });
});

app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/reservations", reservationRoutes);
app.use("/tickets", ticketRoutes);

app.use(errorHandler);

export default app;