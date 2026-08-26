import { prisma } from "../../infra/prisma/client.js";
import { AppError } from "../../errors/app-error.js";

export async function getTicketById(
  ticketId: string,
  customerId: string,
) {
  const ticket = await prisma.ticket.findFirst({
    where: {
      id: ticketId,
      reservation: {
        customerId,
      },
    },
    include: {
      reservation: {
        include: {
          event: true,
        },
      },
    },
  });

  if (!ticket) {
    throw new AppError(404, "Ticket not found");
  }

  return ticket;
}

export async function getTicketByShareToken(
  shareToken: string,
) {
  const ticket = await prisma.ticket.findUnique({
    where: {
      shareToken,
    },
    include: {
      reservation: {
        include: {
          event: true,
        },
      },
    },
  });

  if (!ticket) {
    throw new AppError(404, "Ticket not found");
  }

  return ticket;
}

export async function validateTicket(ticketId: string) {
  const ticket = await prisma.ticket.findUnique({
    where: {
      id: ticketId,
    },
  });

  if (!ticket) {
    throw new AppError(404, "Ticket not found");
  }

  if (ticket.status !== "VALID") {
    throw new AppError(400, "Ticket is not valid");
  }

  return prisma.ticket.update({
    where: {
      id: ticket.id,
    },
    data: {
      status: "USED",
      usedAt: new Date(),
    },
  });
}