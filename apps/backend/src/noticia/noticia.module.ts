import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Noticia } from './noticia.entity';
import { NoticiaController } from './noticia.controller';
import { NoticiaService } from './noticia.service';
import { NOTICIA_REPOSITORY } from './repository/noticia.repository.interface';
import { NoticiaTypeOrmRepository } from './repository/noticia.typeorm-repository';

@Module({
  imports: [TypeOrmModule.forFeature([Noticia])],
  controllers: [NoticiaController],
  providers: [
    NoticiaService,
    { provide: NOTICIA_REPOSITORY, useClass: NoticiaTypeOrmRepository },
  ],
})
export class NoticiaModule {}
