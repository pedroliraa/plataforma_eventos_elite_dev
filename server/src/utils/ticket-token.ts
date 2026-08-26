import jwt from "jsonwebtoken";
import { env } from  "../config/env.js"

export function generateTicketToken(ticketId: string) {
  return jwt.sign(
    {
      ticketId,
    },
    env.JWT_SECRET,
    {
      expiresIn: "30d",
    },
  );
}

export function verifyTicketToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as {
    ticketId: string;
  };
}