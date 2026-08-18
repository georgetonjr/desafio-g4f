import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc, ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app.module';
import { swaggerConfig } from './config/swagger.config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ZodValidationPipe());
  app.enableCors();

  const swaggerDocument = cleanupOpenApiDoc(
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  SwaggerModule.setup('docs', app, swaggerDocument);

  let shuttingDown = false;
  const shutdownGracefully = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.log(`Received ${signal}, shutting down gracefully...`);
    try {
      await app.close();
      process.exit(0);
    } catch (error) {
      logger.error('Error while shutting down the application', error as Error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => void shutdownGracefully('SIGTERM'));
  process.on('SIGINT', () => void shutdownGracefully('SIGINT'));

  await app.listen(process.env.PORT ?? 9000);
}
void bootstrap();
