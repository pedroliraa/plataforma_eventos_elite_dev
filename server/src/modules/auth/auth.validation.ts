import { z } from "zod";

export const registerSchema = z.object({
    name: z.string().trim().min(2),
    email: z.email().trim(),
    password: z.string().min(6),
    role: z.enum(["ORGANIZER", "CUSTOMER", "GATE"]),
});

export const loginSchema = z.object({
    email: z.email().trim(),
    password: z.string().min(1),
})