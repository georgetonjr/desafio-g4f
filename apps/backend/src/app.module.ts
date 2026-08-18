import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envSchema } from './config/env.schema';
import { dataSourceOptions } from './infra/persistence/data-source';
import { NoticiaModule } from './noticia/noticia.module';

const nodeEnv: string | undefined = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => envSchema.parse(config),
    }),
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      autoLoadEntities: true,
      migrationsRun: nodeEnv === 'dev',
    }),
    NoticiaModule,
  ],
})
export class AppModule {}
