import { z } from "zod";

const configSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().default("file:./dev.db"),
});

export const config = configSchema.parse(process.env);
