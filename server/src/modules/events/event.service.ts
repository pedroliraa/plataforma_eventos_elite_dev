import { prisma } from "../../infra/prisma/client.js";
import { AppError } from "../../errors/app-error.js";
import type { CreateEventInput, UpdateEventInput } from "./event.types.js";

export async function createEvent(
    input: CreateEventInput,
    organizerId: string,
) {
    return prisma.event.create({
        data: {
            title: input.title,
            type: input.type,
            date: input.date,
            location: input.location,
            capacity: input.capacity,
            price: input.price,
            source: input.source,
            externalId: input.externalId ?? null,
            organizerId,
        },
    });
}

export async function listEvents() {
    return prisma.event.findMany({
        orderBy: {
            date: "asc",
        },
    });
}

export async function getEventById(id: string) {
    const event = await prisma.event.findUnique({
        where: { id },
    });

    if (!event) {
        throw new AppError(404, "Event not found");
    }

    return event;
}

export async function updateEvent(
    id: string,
    organizerId: string,
    input: UpdateEventInput,
) {
    const event = await prisma.event.findUnique({
        where: { id },
    });

    if (!event) {
        throw new AppError(404, "Event not found");
    }

    if (event.organizerId !== organizerId) {
        throw new AppError(403, "You can only modify your own events");
    }

    return prisma.event.update({
        where: { id },
        data: {
            ...(input.title !== undefined && { title: input.title }),
            ...(input.type !== undefined && { type: input.type }),
            ...(input.date !== undefined && { date: input.date }),
            ...(input.location !== undefined && { location: input.location }),
            ...(input.capacity !== undefined && { capacity: input.capacity }),
            ...(input.price !== undefined && { price: input.price }),
            ...(input.source !== undefined && { source: input.source }),
            ...(input.externalId !== undefined && {
                externalId: input.externalId,
            }),
        },
    });
}

export async function deleteEvent(
    id: string,
    organizerId: string,
) {
    const event = await prisma.event.findUnique({
        where: { id },
    });

    if (!event) {
        throw new AppError(404, "Event not found");
    }

    if (event.organizerId !== organizerId) {
        throw new AppError(403, "You can only delete your own events");
    }


    const reservations = await prisma.reservation.count({
        where: {
            eventId: id,
        },
    });

    if (reservations > 0) {
        throw new AppError(
            409,
            "Não é possível excluir um evento que já possui reservas.",
        );
    }

    return prisma.event.delete({
        where: { id },
    });
}