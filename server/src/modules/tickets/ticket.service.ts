import { prisma } from "../../infra/prisma/client.js";
import { AppError } from "../../errors/app-error.js";
import { verifyTicketToken } from "../../utils/ticket-token.js";

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

export async function validateTicket(
    ticketId: string,
    qrCode: string,
    eventId: string,
) {
    let payload;

    try {
        payload = verifyTicketToken(qrCode);
    } catch {
        throw new AppError(400, "Invalid ticket QR Code");
    }

    if (payload.ticketId !== ticketId) {
        throw new AppError(400, "Invalid ticket");
    }

    const ticket = await prisma.ticket.findUnique({
        where: {
            id: ticketId,
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

    if (ticket.reservation.eventId !== eventId) {
        throw new AppError(400, "Wrong event");
    }

    if (ticket.status === "USED") {
        throw new AppError(400, "Ticket already used");
    }

    if (ticket.status !== "VALID") {
        throw new AppError(400, "Invalid ticket");
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