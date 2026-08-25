import bcrypt from "bcrypt";
import { prisma } from "../../infra/prisma/client.js";
import { AppError } from "../../errors/app-error.js";
import type { RegisterInput, LoginInput } from "./auth.types.js";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

export async function register(input: RegisterInput) {

    const existingUser = await prisma.user.findUnique({
        where: {
            email: input.email,
        },
    });

    if (existingUser) {
        throw new AppError(409, "Email already registered");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
        data: {
            name: input.name,
            email: input.email,
            passwordHash,
            role: input.role,
        },
    });

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  });

  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(
    input.password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new AppError(401, "Invalid email or password");
  }

  const token = jwt.sign(
    {
      role: user.role,
    },
    env.JWT_SECRET,
    {
      subject: user.id,
      expiresIn: "1h",
    },
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
}