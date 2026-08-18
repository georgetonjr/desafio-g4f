import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Noticia } from './noticia.entity';
import { NoticiaService } from './noticia.service';
import { NoticiaCacheService } from './cache/noticia-cache.service';
import {
  ListarNoticiasInput,
  NoticiaPaginada,
  NOTICIA_REPOSITORY,
  NoticiaRepository,
} from './repository/noticia.repository.interface';
import { resolved } from '../../test/helpers/promise-util';

class NoticiaRepositoryFake implements NoticiaRepository {
  private noticias: Noticia[] = [];
  listarChamadas = 0;

  criar(dados: { titulo: string; descricao: string }): Promise<Noticia> {
    return resolved(() => {
      const noticia = {
        id: String(this.noticias.length + 1),
        criadoEm: new Date(),
        atualizadoEm: new Date(),
        ...dados,
      };
      this.noticias.push(noticia);
      return noticia;
    });
  }

  listar(dados: ListarNoticiasInput): Promise<NoticiaPaginada> {
    return resolved(() => {
      this.listarChamadas += 1;
      const filtradas = dados.busca
        ? this.noticias.filter(
            (noticia) =>
              noticia.titulo.includes(dados.busca as string) ||
              noticia.descricao.includes(dados.busca as string),
          )
        : this.noticias;
      const inicio = (dados.pagina - 1) * dados.limite;
      return {
        itens: filtradas.slice(inicio, inicio + dados.limite),
        total: filtradas.length,
      };
    });
  }

  buscarPorId(id: string): Promise<Noticia | null> {
    return resolved(
      () => this.noticias.find((noticia) => noticia.id === id) ?? null,
    );
  }

  async atualizar(
    id: string,
    dados: { titulo?: string; descricao?: string },
  ): Promise<Noticia | null> {
    const noticia = await this.buscarPorId(id);
    if (!noticia) {
      return null;
    }
    Object.assign(noticia, dados);
    return noticia;
  }

  remover(id: string): Promise<boolean> {
    return resolved(() => {
      const tamanhoAntes = this.noticias.length;
      this.noticias = this.noticias.filter((noticia) => noticia.id !== id);
      return this.noticias.length < tamanhoAntes;
    });
  }
}

describe('NoticiaService', () => {
  let service: NoticiaService;
  let repository: NoticiaRepositoryFake;

  beforeEach(async () => {
    repository = new NoticiaRepositoryFake();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoticiaService,
        NoticiaCacheService,
        { provide: NOTICIA_REPOSITORY, useValue: repository },
      ],
    }).compile();

    service = module.get(NoticiaService);
  });

  it('criar retorna a notícia criada', async () => {
    const noticia = await service.criar({
      titulo: 'Título',
      descricao: 'Descrição',
    });

    expect(noticia.titulo).toBe('Título');
    expect(noticia.descricao).toBe('Descrição');
    expect(noticia.id).toBeDefined();
  });

  it('buscarPorId lança NotFoundException quando não existe', async () => {
    await expect(service.buscarPorId('id-inexistente')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('remover lança NotFoundException quando não existe', async () => {
    await expect(service.remover('id-inexistente')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('listar retorna itens, total e metadados de paginação', async () => {
    await service.criar({ titulo: 'Título 1', descricao: 'Descrição 1' });
    await service.criar({ titulo: 'Título 2', descricao: 'Descrição 2' });

    const resultado = await service.listar({ pagina: 1, limite: 1 });

    expect(resultado.itens).toHaveLength(1);
    expect(resultado.total).toBe(2);
    expect(resultado.pagina).toBe(1);
    expect(resultado.limite).toBe(1);
    expect(resultado.totalPaginas).toBe(2);
  });

  it('listar usa o cache em chamadas subsequentes com o mesmo filtro', async () => {
    await service.criar({ titulo: 'Título', descricao: 'Descrição' });

    await service.listar({ pagina: 1, limite: 10 });
    await service.listar({ pagina: 1, limite: 10 });

    expect(repository.listarChamadas).toBe(1);
  });

  it('criar invalida o cache da listagem', async () => {
    await service.listar({ pagina: 1, limite: 10 });
    await service.criar({ titulo: 'Título', descricao: 'Descrição' });

    const resultado = await service.listar({ pagina: 1, limite: 10 });

    expect(resultado.total).toBe(1);
    expect(repository.listarChamadas).toBe(2);
  });

  it('atualizar invalida o cache da listagem', async () => {
    const noticia = await service.criar({
      titulo: 'Título',
      descricao: 'Descrição',
    });
    await service.listar({ pagina: 1, limite: 10 });

    await service.atualizar(noticia.id, { titulo: 'Título atualizado' });
    await service.listar({ pagina: 1, limite: 10 });

    expect(repository.listarChamadas).toBe(2);
  });

  it('remover invalida o cache da listagem', async () => {
    const noticia = await service.criar({
      titulo: 'Título',
      descricao: 'Descrição',
    });
    await service.listar({ pagina: 1, limite: 10 });

    await service.remover(noticia.id);
    await service.listar({ pagina: 1, limite: 10 });

    expect(repository.listarChamadas).toBe(2);
  });

  it('busca com caixa diferente reaproveita o cache da mesma consulta', async () => {
    await service.criar({ titulo: 'Eleições', descricao: 'Cobertura' });

    await service.listar({ pagina: 1, limite: 10, busca: 'eleições' });
    await service.listar({ pagina: 1, limite: 10, busca: 'ELEIÇÕES' });

    expect(repository.listarChamadas).toBe(1);
  });

  it('não grava no cache um resultado buscado antes de uma invalidação concorrente', async () => {
    let resolverListagem: (valor: NoticiaPaginada) => void;
    const listagemAtrasada = new Promise<NoticiaPaginada>((resolve) => {
      resolverListagem = resolve;
    });

    const repositorioComAtraso: NoticiaRepository = {
      criar: (dados) => repository.criar(dados),
      listar: jest
        .fn()
        .mockReturnValueOnce(listagemAtrasada)
        .mockImplementation((dados: ListarNoticiasInput) =>
          repository.listar(dados),
        ),
      buscarPorId: (id) => repository.buscarPorId(id),
      atualizar: (id, dados) => repository.atualizar(id, dados),
      remover: (id) => repository.remover(id),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoticiaService,
        NoticiaCacheService,
        { provide: NOTICIA_REPOSITORY, useValue: repositorioComAtraso },
      ],
    }).compile();

    const servicoComAtraso = module.get(NoticiaService);

    const listagemEmAndamento = servicoComAtraso.listar({
      pagina: 1,
      limite: 10,
    });

    await servicoComAtraso.criar({ titulo: 'Título', descricao: 'Descrição' });

    resolverListagem!({ itens: [], total: 0 });
    await listagemEmAndamento;

    const resultado = await servicoComAtraso.listar({ pagina: 1, limite: 10 });

    expect(resultado.total).toBe(1);
  });
});
