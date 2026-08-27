import "dotenv/config";
import { env } from "../src/config/env";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  Role,
  EventType,
  EventSource,
  EventStatus,
} from "../src/generated/prisma/enums";
import bcrypt from "bcrypt";
import { PrismaPg }  from "@prisma/adapter-pg"

const connectionString = env.DATABASE_URL;

if(!connectionString){
    throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
    connectionString,
});

const prisma = new PrismaClient({
    adapter,
});

async function main() {

    const passwordHash = await bcrypt.hash("123456", 10);

    const organizer = await prisma.user.upsert({
        where: {
            email: "organizer@eliteevents.com"
        },
        update: {},
        create: {
            name: "Elite Events Organizer",
            email: "organizer@eliteevents.com",
            passwordHash,
            role: Role.ORGANIZER,
        },
    });

    const customer1 = await prisma.user.upsert({
        where: {
            email: "cliente1@eliteevents.com"
        },
        update: {},
        create: {
            name: "Cliente 1",
            email: "cliente1@eliteevents.com",
            passwordHash,
            role: Role.CUSTOMER,
        },
    });

    const customer2 = await prisma.user.upsert({
        where: {
            email: "cliente2@eliteevents.com",
        },
        update: {},
        create: {
            name: "Cliente 2",
            email: "cliente2@eliteevents.com",
            passwordHash,
            role: Role.CUSTOMER,
        },
    });

    const gate = await prisma.user.upsert({
        where: {
            email: "gate@eliteevents.com",
        },
        update: {},
        create: {
            name: "Elite Events Gate",
            email: "gate@eliteevents.com",
            passwordHash,
            role: Role.GATE,
        },
    });

    const event = await prisma.event.create({
       data: {
        title: "Cinema Night: The Rocky Horror Picture Show",
        type: EventType.MOVIE,
        date: new Date("2026-09-15T20:00:00-03:00"),
        location: "Teatro Elite",
        capacity: 100,
        price: 35.00,
        status: EventStatus.PUBLISHED,
        source: EventSource.MANUAL,
        publishedAt: new Date(),
        organizerId: organizer.id,
       },
});

console.log("Seed completo com sucesso!");
console.log({
    organizer: organizer.email,
    customer1: customer1.email,
    customer2: customer2.email,
    gate: gate.email,
    event: event.title,
});
}

main()
.catch((error) => {
    console.error("Seed falhou", error);
    process.exit(1);
})
.finally(async() => {
    await prisma.$disconnect();
});
