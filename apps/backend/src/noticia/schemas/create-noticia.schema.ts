import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const createNoticiaSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(1, 'titulo é obrigatório')
    .max(255, 'titulo deve ter no máximo 255 caracteres'),
  descricao: z.string().trim().min(1, 'descricao é obrigatória'),
});

export class CreateNoticiaDto extends createZodDto(createNoticiaSchema) {}
