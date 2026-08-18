import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const noticiaResponseSchema = z.object({
  id: z.uuid(),
  titulo: z.string(),
  descricao: z.string(),
  criadoEm: z.date(),
  atualizadoEm: z.date(),
});

export class NoticiaResponseDto extends createZodDto(noticiaResponseSchema) {}
