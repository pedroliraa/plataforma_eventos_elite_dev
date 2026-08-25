import type { Response } from "express";
import type { AuthRequest } from "../../middlewares/auth.js";
import {
    createEventSchema,
    updateEventSchema,
} from "./event.validation.js";
import {
    createEvent,
    deleteEvent,
    getEventById,
    listEvents,
    updateEvent,
} from "./event.service.js";
import { AppError } from "../../errors/app-error.js";


function getParamId(value: string | string[] | undefined): string {
    if (typeof value !== "string") {
        throw new AppError(400, "Invalid event id");
    }

    return value;
}

export async function createEventController(
    req: AuthRequest,
    res: Response,
) {

    const input = createEventSchema.parse(req.body);

    const event = await createEvent(input, req.user!.id);

    return res.status(201).json(event);
}

export async function listEventsController(
    _req: AuthRequest,
    res: Response,
) {
    const events = await listEvents();

    return res.json(events);
}

export async function getEventController(
    req: AuthRequest,
    res: Response,
) {

    const id = getParamId(req.params.id);

    const event = await getEventById(id);

    return res.json(event);
}

export async function updateEventController(
    req: AuthRequest,
    res: Response,
) {
    const input = updateEventSchema.parse(req.body);

    const id = getParamId(req.params.id);

    const event = await updateEvent(
        id,
        req.user!.id,
        input,
    );

    return res.json(event);
}

export async function deleteEventController(
    req: AuthRequest,
    res: Response,
) {

const id = getParamId(req.params.id);

    await deleteEvent(
        id,
        req.user!.id,
    );

    return res.status(204).send();
}