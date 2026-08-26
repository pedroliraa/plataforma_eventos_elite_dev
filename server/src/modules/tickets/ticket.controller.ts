import type { Response } from "express";
import type { AuthRequest } from "../../middlewares/auth.js";
import {
    getTicketById,
    getTicketByShareToken,
    validateTicket,
} from "./ticket.service.js"

export async function getTicketController(
    req: AuthRequest,
    res: Response,
) {
    const ticket = await getTicketById(
        req.params.id as string,
        req.user!.id,
    );

    return res.json(ticket);
}

export async function getTicketByShareTokenController(
    req: AuthRequest,
    res: Response,
) {
    const ticket = await getTicketByShareToken(
        req.params.shareToken as string,
    );

    return res.json(ticket);
}

export async function validateTicketController(
  req: AuthRequest,
  res: Response,
) {
  const ticket = await validateTicket(
    req.params.id as string,
    req.body.qrCode,
    req.body.eventId,
  );

  return res.json({
    message: "Ticket validated successfully",
    ticket,
  });
}