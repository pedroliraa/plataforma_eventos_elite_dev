import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../errors/app-error.js";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: "ORGANIZER" | "CUSTOMER" | "GATE";
  };
}

export function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    throw new AppError(401, "Authentication required");
  }

  const token = authorization.substring(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);

    if (
      typeof payload !== "object" ||
      !payload.sub ||
      !payload.role
    ) {
      throw new AppError(401, "Invalid token");
    }

    req.user = {
      id: payload.sub,
      role: payload.role as "ORGANIZER" | "CUSTOMER" | "GATE",
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(401, "Invalid or expired token");
  }
}

export function authorize(
  ...allowedRoles: Array<"ORGANIZER" | "CUSTOMER" | "GATE">
) {
  return (
    req: AuthRequest,
    _res: Response,
    next: NextFunction,
  ) => {
    if (!req.user) {
      throw new AppError(401, "Authentication required");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(403, "Insufficient permissions");
    }

    next();
  };
}