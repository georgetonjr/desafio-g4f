import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { noticiaResponseSchema } from './noticia-response.schema';

export const noticiaPaginadaResponseSchema = z.object({
  itens: z.array(noticiaResponseSchema),
  total: z.number().int(),
  pagina: z.number().int(),
  limite: z.number().int(),
  totalPaginas: z.number().int(),
});

export class NoticiaPaginadaResponseDto extends createZodDto(
  noticiaPaginadaResponseSchema,
) {}
