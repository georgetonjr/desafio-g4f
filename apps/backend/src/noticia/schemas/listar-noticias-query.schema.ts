import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const listarNoticiasQuerySchema = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(10),
  busca: z.string().trim().min(1).optional(),
});

export class ListarNoticiasQueryDto extends createZodDto(
  listarNoticiasQuerySchema,
) {}
