import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string().min(1),
    JWT_SECRET: z.string().min(32),
    TMDB_API_TOKEN: z.string()
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {

    console.error("Variáveis de ambiente inválidas!");

    console.error(z.treeifyError(parsedEnv.error));

    process.exit(1);
}

export const env = parsedEnv.data