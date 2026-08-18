import { describe, expect, it, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  listarNoticias,
  criarNoticia,
  atualizarNoticia,
  removerNoticia,
  ErroNoticia,
} from './servicoNoticia';

vi.mock('axios');

const URL_BASE_API = 'http://localhost:9000/api';

describe('listarNoticias', () => {
  beforeEach(() => {
    vi.mocked(axios.get).mockReset();
  });

  it('retorna a listagem paginada quando a requisição é bem-sucedida', async () => {
    const paginada = {
      itens: [
        {
          id: '1',
          titulo: 'Eleições municipais',
          descricao: 'Cobertura local',
          criadoEm: '2026-08-18T00:00:00.000Z',
          atualizadoEm: '2026-08-18T00:00:00.000Z',
        },
      ],
      total: 1,
      pagina: 1,
      limite: 10,
      totalPaginas: 1,
    };
    vi.mocked(axios.get).mockResolvedValueOnce({ data: paginada });

    const resultado = await listarNoticias({ pagina: 1, limite: 10 });

    expect(resultado).toEqual(paginada);
    expect(axios.get).toHaveBeenCalledWith(`${URL_BASE_API}/noticias`, {
      params: { pagina: 1, limite: 10 },
    });
  });

  it('lança ErroNoticia quando a requisição falha', async () => {
    vi.mocked(axios.get).mockRejectedValueOnce(new Error('falha de rede'));

    await expect(listarNoticias()).rejects.toThrow(ErroNoticia);
  });
});

describe('criarNoticia', () => {
  beforeEach(() => {
    vi.mocked(axios.post).mockReset();
  });

  it('retorna a notícia criada quando a requisição é bem-sucedida', async () => {
    const noticiaCriada = {
      id: '1',
      titulo: 'Título',
      descricao: 'Descrição',
      criadoEm: '2026-08-18T00:00:00.000Z',
      atualizadoEm: '2026-08-18T00:00:00.000Z',
    };
    vi.mocked(axios.post).mockResolvedValueOnce({ data: noticiaCriada });

    const resultado = await criarNoticia({
      titulo: 'Título',
      descricao: 'Descrição',
    });

    expect(resultado).toEqual(noticiaCriada);
    expect(axios.post).toHaveBeenCalledWith(`${URL_BASE_API}/noticias`, {
      titulo: 'Título',
      descricao: 'Descrição',
    });
  });

  it('lança ErroNoticia quando a requisição falha', async () => {
    vi.mocked(axios.post).mockRejectedValueOnce(new Error('falha de rede'));

    await expect(
      criarNoticia({ titulo: 'Título', descricao: 'Descrição' }),
    ).rejects.toThrow(ErroNoticia);
  });
});

describe('atualizarNoticia', () => {
  beforeEach(() => {
    vi.mocked(axios.patch).mockReset();
  });

  it('retorna a notícia atualizada quando a requisição é bem-sucedida', async () => {
    const noticiaAtualizada = {
      id: '1',
      titulo: 'Título atualizado',
      descricao: 'Descrição',
      criadoEm: '2026-08-18T00:00:00.000Z',
      atualizadoEm: '2026-08-18T01:00:00.000Z',
    };
    vi.mocked(axios.patch).mockResolvedValueOnce({ data: noticiaAtualizada });

    const resultado = await atualizarNoticia('1', {
      titulo: 'Título atualizado',
    });

    expect(resultado).toEqual(noticiaAtualizada);
    expect(axios.patch).toHaveBeenCalledWith(`${URL_BASE_API}/noticias/1`, {
      titulo: 'Título atualizado',
    });
  });

  it('lança ErroNoticia quando a requisição falha', async () => {
    vi.mocked(axios.patch).mockRejectedValueOnce(new Error('falha de rede'));

    await expect(atualizarNoticia('1', { titulo: 'Título' })).rejects.toThrow(
      ErroNoticia,
    );
  });
});

describe('removerNoticia', () => {
  beforeEach(() => {
    vi.mocked(axios.delete).mockReset();
  });

  it('resolve quando a requisição é bem-sucedida', async () => {
    vi.mocked(axios.delete).mockResolvedValueOnce({});

    await expect(removerNoticia('1')).resolves.toBeUndefined();
    expect(axios.delete).toHaveBeenCalledWith(`${URL_BASE_API}/noticias/1`);
  });

  it('lança ErroNoticia quando a requisição falha', async () => {
    vi.mocked(axios.delete).mockRejectedValueOnce(new Error('falha de rede'));

    await expect(removerNoticia('1')).rejects.toThrow(ErroNoticia);
  });
});
