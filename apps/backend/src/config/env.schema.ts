import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'prod']).default('dev'),
  DB_HOST: z.string().trim().min(1, 'DB_HOST é obrigatório'),
  DB_PORT: z.coerce.number().int().positive(),
  DB_USER: z.string().trim().min(1, 'DB_USER é obrigatório'),
  DB_PASSWORD: z.string().trim().min(1, 'DB_PASSWORD é obrigatório'),
  DB_NAME: z.string().trim().min(1, 'DB_NAME é obrigatório'),
  PORT: z.coerce.number().int().positive().default(3000),
});

export type Env = z.infer<typeof envSchema>;
