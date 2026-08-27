import type { Response } from "express";
import type { AuthRequest } from "../../middlewares/auth.js";
import { createReservationSchema, payReservationSchema } from "./reservation.validation.js";
import {
  createReservation,
  getReservationById,
  listReservations,
  payReservation,
} from "./reservation.service.js";

export async function createReservationController(
  req: AuthRequest,
  res: Response,
) {
  const input = createReservationSchema.parse(req.body);

  const reservation = await createReservation(
    input,
    req.user!.id,
  );

  return res.status(201).json(reservation);
}

export async function listReservationsController(
  req: AuthRequest,
  res: Response,
) {
  const reservations = await listReservations(
    req.user!.id,
  );

  return res.json(reservations);
}

export async function getReservationController(
  req: AuthRequest,
  res: Response,
) {
  const reservation = await getReservationById(
    req.params.id as string,
    req.user!.id,
  );

  return res.json(reservation);
}

export async function payReservationController(
  req: AuthRequest,
  res: Response,
) {
  const input = payReservationSchema.parse(req.body);

  const reservation = await payReservation(
    req.params.id as string,
    req.user!.id,
    input.approved,
  );

  return res.json(reservation);
}