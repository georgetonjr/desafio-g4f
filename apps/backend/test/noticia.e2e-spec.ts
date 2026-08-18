import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import request from 'supertest';
import { App } from 'supertest/types';

interface NoticiaResponseBody {
  id: string;
  titulo: string;
  descricao: string;
}

interface NoticiaPaginadaResponseBody {
  itens: NoticiaResponseBody[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

describe('NoticiaController (e2e)', () => {
  let container: StartedPostgreSqlContainer;
  let app: INestApplication<App>;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16-alpine').start();

    process.env.NODE_ENV = 'dev';
    process.env.DB_HOST = container.getHost();
    process.env.DB_PORT = String(container.getPort());
    process.env.DB_USER = container.getUsername();
    process.env.DB_PASSWORD = container.getPassword();
    process.env.DB_NAME = container.getDatabase();

    const appModuleExports =
      (await import('../src/app.module')) as typeof import('../src/app.module');
    const { AppModule } = appModuleExports;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ZodValidationPipe());
    await app.init();
  }, 60000);

  afterAll(async () => {
    await app.close();
    await container.stop();
  });

  describe('POST /noticias', () => {
    it('dado um payload válido, quando POST /noticias, então retorna 201 com a notícia criada', async () => {
      // Given
      const payload = {
        titulo: 'Título de teste',
        descricao: 'Descrição de teste',
      };

      // When
      const response = await request(app.getHttpServer())
        .post('/api/noticias')
        .send(payload);

      // Then
      const body = response.body as NoticiaResponseBody;
      expect(response.status).toBe(201);
      expect(body).toMatchObject(payload);
      expect(body.id).toBeDefined();
    });

    it('dado um payload inválido, quando POST /noticias, então retorna 400 e nenhuma notícia é persistida', async () => {
      // Given
      const payloadInvalido = { descricao: 'Notícia sem título obrigatório' };

      // When
      const responseInvalida = await request(app.getHttpServer())
        .post('/api/noticias')
        .send(payloadInvalido);

      // Then
      expect(responseInvalida.status).toBe(400);

      const listagem = await request(app.getHttpServer()).get(
        '/api/noticias?limite=100',
      );
      const body = listagem.body as NoticiaPaginadaResponseBody;
      const encontrada = body.itens.find(
        (noticia) => noticia.descricao === 'Notícia sem título obrigatório',
      );
      expect(encontrada).toBeUndefined();
    });
  });

  describe('GET /noticias', () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .post('/api/noticias')
        .send({ titulo: 'Eleições municipais', descricao: 'Cobertura local' });
      await request(app.getHttpServer()).post('/api/noticias').send({
        titulo: 'Copa do mundo',
        descricao: 'Resultado das eleições',
      });
      await request(app.getHttpServer())
        .post('/api/noticias')
        .send({ titulo: 'Clima hoje', descricao: 'Previsão do tempo' });
    });

    it('dado o limite informado, quando GET /noticias, então retorna a quantidade de itens e os metadados corretos', async () => {
      // When
      const response = await request(app.getHttpServer()).get(
        '/api/noticias?pagina=1&limite=2',
      );

      // Then
      const body = response.body as NoticiaPaginadaResponseBody;
      expect(response.status).toBe(200);
      expect(body.itens).toHaveLength(2);
      expect(body.pagina).toBe(1);
      expect(body.limite).toBe(2);
      expect(body.totalPaginas).toBe(Math.ceil(body.total / body.limite));
    });

    it('dado um termo de busca, quando GET /noticias, então filtra por titulo ou descricao', async () => {
      // When
      const response = await request(app.getHttpServer()).get(
        '/api/noticias?busca=eleições',
      );

      // Then
      const body = response.body as NoticiaPaginadaResponseBody;
      expect(response.status).toBe(200);
      expect(body.total).toBe(2);
      expect(
        body.itens.every(
          (noticia) =>
            noticia.titulo.toLowerCase().includes('eleições') ||
            noticia.descricao.toLowerCase().includes('eleições'),
        ),
      ).toBe(true);
    });
  });
});
