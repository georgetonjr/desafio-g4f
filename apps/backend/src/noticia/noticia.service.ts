import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Noticia } from './noticia.entity';
import { NoticiaCacheService } from './cache/noticia-cache.service';
import { NOTICIA_REPOSITORY } from './repository/noticia.repository.interface';
import type {
  ListarNoticiasInput,
  NoticiaInput,
  NoticiaPaginada,
  NoticiaRepository,
} from './repository/noticia.repository.interface';

export type NoticiaListada = {
  itens: Noticia[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
};

@Injectable()
export class NoticiaService {
  constructor(
    @Inject(NOTICIA_REPOSITORY) private readonly repository: NoticiaRepository,
    private readonly cache: NoticiaCacheService,
  ) {}

  async criar(dados: NoticiaInput): Promise<Noticia> {
    const noticia = await this.repository.criar(dados);
    this.cache.invalidate();
    return noticia;
  }

  async listar(dados: ListarNoticiasInput): Promise<NoticiaListada> {
    const busca = dados.busca?.toLowerCase();
    const chave = `${dados.pagina}:${dados.limite}:${busca ?? ''}`;

    const cached = this.cache.get(chave);
    if (cached) {
      return this.montarResposta(cached, dados);
    }

    const versionAtFetch = this.cache.getVersion();
    const resultado = await this.repository.listar(dados);
    this.cache.set(chave, resultado, versionAtFetch);

    return this.montarResposta(resultado, dados);
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
    this.cache.invalidate();
    return noticia;
  }

  async remover(id: string): Promise<void> {
    const removida = await this.repository.remover(id);
    if (!removida) {
      throw new NotFoundException(`Notícia ${id} não encontrada`);
    }
    this.cache.invalidate();
  }

  private montarResposta(
    { itens, total }: NoticiaPaginada,
    dados: ListarNoticiasInput,
  ): NoticiaListada {
    return {
      itens,
      total,
      pagina: dados.pagina,
      limite: dados.limite,
      totalPaginas: total === 0 ? 0 : Math.ceil(total / dados.limite),
    };
  }
}
