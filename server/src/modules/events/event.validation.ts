import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(1),
  type: z.enum(["MOVIE", "SHOW"]),
  date: z.coerce.date(),
  location: z.string().min(1),
  capacity: z.number().int().positive(),
  price: z.number().nonnegative(),
  source: z.enum(["MANUAL", "TMDB", "TICKETMASTER"]).default("MANUAL"),
  externalId: z.string().optional(),
});

export const updateEventSchema = createEventSchema.partial();