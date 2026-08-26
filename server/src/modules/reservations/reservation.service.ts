import { prisma } from "../../infra/prisma/client.js";
import { AppError } from "../../errors/app-error.js";
import type { CreateReservationInput } from "./reservation.types.js";
import crypto from "node:crypto";

export async function createReservation(
  input: CreateReservationInput,
  customerId: string,
) {
  const event = await prisma.event.findUnique({
    where: {
      id: input.eventId,
    },
  });

  if (!event) {
    throw new AppError(404, "Event not found");
  }

  const reservations = await prisma.reservation.aggregate({
    where: {
      eventId: event.id,
      status: {
        in: ["PENDING", "PAID"],
      },
    },
    _sum: {
      quantity: true,
    },
  });

  const reservedQuantity = reservations._sum.quantity ?? 0;

  if (reservedQuantity + input.quantity > event.capacity) {
    throw new AppError(400, "Not enough capacity available");
  }

  return prisma.reservation.create({
    data: {
      eventId: event.id,
      customerId,
      quantity: input.quantity,
    },
  });
}

export async function listReservations(customerId: string) {
  return prisma.reservation.findMany({
    where: {
      customerId,
    },
    include: {
      event: true,
      tickets: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getReservationById(
  id: string,
  customerId: string,
) {
  const reservation = await prisma.reservation.findFirst({
    where: {
      id,
      customerId,
    },
    include: {
      event: true,
      tickets: true,
    },
  });

  if (!reservation) {
    throw new AppError(404, "Reservation not found");
  }

  return reservation;
}

export async function payReservation(
  reservationId: string,
  customerId: string,
) {
  const reservation = await prisma.reservation.findFirst({
    where: {
      id: reservationId,
      customerId,
    },
    include: {
      event: true,
    },
  });

  if (!reservation) {
    throw new AppError(404, "Reservation not found");
  }

  if (reservation.status !== "PENDING") {
    throw new AppError(
      400,
      "Only pending reservations can be paid",
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const paidReservation = await tx.reservation.update({
      where: {
        id: reservation.id,
      },
      data: {
        status: "PAID",
      },
    });

    await tx.ticket.createMany({
      data: Array.from(
        { length: reservation.quantity },
        () => ({
          reservationId: reservation.id,
          qrCode: crypto.randomUUID(),
        }),
      ),
    });

    return paidReservation;
  });

  return result;
}