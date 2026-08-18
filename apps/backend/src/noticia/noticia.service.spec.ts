import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Noticia } from './noticia.entity';
import { NoticiaService } from './noticia.service';
import {
  NOTICIA_REPOSITORY,
  NoticiaRepository,
} from './repository/noticia.repository.interface';
import { resolved } from '../../test/helpers/promise-util';

class NoticiaRepositoryFake implements NoticiaRepository {
  private noticias: Noticia[] = [];

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

  listarTodas(): Promise<Noticia[]> {
    return resolved(() => this.noticias);
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoticiaService,
        { provide: NOTICIA_REPOSITORY, useClass: NoticiaRepositoryFake },
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
});
