import type { Request, Response } from "express";
import { loginSchema, registerSchema } from "./auth.validation.js";
import { login, register } from "./auth.service.js";


export async function registerController(
    req: Request,
    res: Response,
){
    const input = registerSchema.parse(req.body);

    const user = await register(input);

    return res.status(201).json({
        user,
    });
}

export async function loginController(
  req: Request,
  res: Response,
) {
  const input = loginSchema.parse(req.body);

  const result = await login(input);

  return res.status(200).json(result);
}