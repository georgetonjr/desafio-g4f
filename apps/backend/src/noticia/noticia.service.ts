import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Noticia } from './noticia.entity';
import { NOTICIA_REPOSITORY } from './repository/noticia.repository.interface';
import type {
  NoticiaInput,
  NoticiaRepository,
} from './repository/noticia.repository.interface';

@Injectable()
export class NoticiaService {
  constructor(
    @Inject(NOTICIA_REPOSITORY) private readonly repository: NoticiaRepository,
  ) {}

  criar(dados: NoticiaInput): Promise<Noticia> {
    return this.repository.criar(dados);
  }

  listarTodas(): Promise<Array<Noticia>> {
    return this.repository.listarTodas();
  }

  async buscarPorId(id: string): Promise<Noticia> {
    const noticia = await this.repository.buscarPorId(id);
    if (!noticia) {
      throw new NotFoundException(`Notícia ${id} não encontrada`);
    }
    return noticia;
  }

  async atualizar(id: string, dados: Partial<NoticiaInput>): Promise<Noticia> {
    const noticia = await this.repository.atualizar(id, dados);
    if (!noticia) {
      throw new NotFoundException(`Notícia ${id} não encontrada`);
    }
    return noticia;
  }

  async remover(id: string): Promise<void> {
    const removida = await this.repository.remover(id);
    if (!removida) {
      throw new NotFoundException(`Notícia ${id} não encontrada`);
    }
  }
}
