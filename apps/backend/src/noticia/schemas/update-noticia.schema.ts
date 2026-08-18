import { createZodDto } from 'nestjs-zod';
import { createNoticiaSchema } from './create-noticia.schema';

export const updateNoticiaSchema = createNoticiaSchema.partial();

export class UpdateNoticiaDto extends createZodDto(updateNoticiaSchema) {}
