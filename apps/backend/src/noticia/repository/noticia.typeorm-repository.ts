import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Noticia } from '../noticia.entity';
import {
  NoticiaInput,
  NoticiaRepository,
} from './noticia.repository.interface';

@Injectable()
export class NoticiaTypeOrmRepository implements NoticiaRepository {
  constructor(
    @InjectRepository(Noticia) private readonly repo: Repository<Noticia>,
  ) {}

  async criar(dados: NoticiaInput): Promise<Noticia> {
    const noticia = this.repo.create(dados);
    return this.repo.save(noticia);
  }

  async listarTodas(): Promise<Array<Noticia>> {
    return this.repo.find();
  }

  async buscarPorId(id: string): Promise<Noticia | null> {
    return this.repo.findOneBy({ id });
  }

  async atualizar(
    id: string,
    dados: Partial<NoticiaInput>,
  ): Promise<Noticia | null> {
    const noticia = await this.buscarPorId(id);
    if (!noticia) {
      return null;
    }
    Object.assign(noticia, dados);
    return this.repo.save(noticia);
  }

  async remover(id: string): Promise<boolean> {
    const resultado = await this.repo.delete(id);
    return (resultado.affected ?? 0) > 0;
  }
}
