import { z } from "zod";

export const createReservationSchema = z.object({
  eventId: z.string().uuid(),
  quantity: z.number().int().positive(),
});