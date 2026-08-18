import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Desafio G4F API')
  .setDescription('API documentation')
  .setVersion('1.0')
  .build();
