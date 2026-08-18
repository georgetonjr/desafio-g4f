import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const dataISO = z.preprocess(
  (valor) => (valor instanceof Date ? valor.toISOString() : valor),
  z.iso.datetime(),
);

export const noticiaResponseSchema = z.object({
  id: z.uuid(),
  titulo: z.string(),
  descricao: z.string(),
  criadoEm: dataISO,
  atualizadoEm: dataISO,
});

export class NoticiaResponseDto extends createZodDto(noticiaResponseSchema) {}
