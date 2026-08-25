import express from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import { errorHandler } from "./middlewares/error-handle.js";

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "Elite Events and Tickets API is running",
  });
});

app.use("/auth", authRoutes);

app.use(errorHandler);

export default app;