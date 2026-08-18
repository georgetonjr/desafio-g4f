import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useNoticiaMutation } from './useNoticiaMutation';
import {
  criarNoticia,
  atualizarNoticia,
  removerNoticia,
  ErroNoticia,
} from '../services/servicoNoticia';

vi.mock('../services/servicoNoticia', async () => {
  const modulo = await vi.importActual<
    typeof import('../services/servicoNoticia')
  >('../services/servicoNoticia');
  return {
    ...modulo,
    criarNoticia: vi.fn(),
    atualizarNoticia: vi.fn(),
    removerNoticia: vi.fn(),
  };
});

const noticia = {
  id: '1',
  titulo: 'Título',
  descricao: 'Descrição',
  criadoEm: '2026-08-18T00:00:00.000Z',
  atualizadoEm: '2026-08-18T00:00:00.000Z',
};

describe('useNoticiaMutation', () => {
  beforeEach(() => {
    vi.mocked(criarNoticia).mockReset();
    vi.mocked(atualizarNoticia).mockReset();
    vi.mocked(removerNoticia).mockReset();
  });

  it('cria uma notícia com sucesso', async () => {
    vi.mocked(criarNoticia).mockResolvedValueOnce(noticia);
    const { result } = renderHook(() => useNoticiaMutation());

    let retorno: typeof noticia | null = null;
    await act(async () => {
      retorno = await result.current.criar({
        titulo: 'Título',
        descricao: 'Descrição',
      });
    });

    expect(retorno).toEqual(noticia);
    expect(result.current.erro).toBeNull();
  });

  it('define erro quando a criação falha', async () => {
    vi.mocked(criarNoticia).mockRejectedValueOnce(
      new ErroNoticia('Não foi possível criar a notícia.'),
    );
    const { result } = renderHook(() => useNoticiaMutation());

    let retorno: typeof noticia | null = noticia;
    await act(async () => {
      retorno = await result.current.criar({
        titulo: 'Título',
        descricao: 'Descrição',
      });
    });

    expect(retorno).toBeNull();
    expect(result.current.erro).toBe('Não foi possível criar a notícia.');
  });

  it('atualiza uma notícia com sucesso', async () => {
    vi.mocked(atualizarNoticia).mockResolvedValueOnce(noticia);
    const { result } = renderHook(() => useNoticiaMutation());

    let retorno: typeof noticia | null = null;
    await act(async () => {
      retorno = await result.current.atualizar('1', {
        titulo: 'Título',
        descricao: 'Descrição',
      });
    });

    expect(retorno).toEqual(noticia);
  });

  it('remove uma notícia com sucesso', async () => {
    vi.mocked(removerNoticia).mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useNoticiaMutation());

    let sucesso = false;
    await act(async () => {
      sucesso = await result.current.remover('1');
    });

    expect(sucesso).toBe(true);
  });

  it('define erro quando a remoção falha', async () => {
    vi.mocked(removerNoticia).mockRejectedValueOnce(
      new ErroNoticia('Não foi possível remover a notícia.'),
    );
    const { result } = renderHook(() => useNoticiaMutation());

    let sucesso = true;
    await act(async () => {
      sucesso = await result.current.remover('1');
    });

    expect(sucesso).toBe(false);
    expect(result.current.erro).toBe('Não foi possível remover a notícia.');
  });

  it('indica salvando durante a criação', async () => {
    let resolver: (valor: typeof noticia) => void = () => {};
    vi.mocked(criarNoticia).mockReturnValueOnce(
      new Promise((resolve) => {
        resolver = resolve;
      }),
    );

    const { result } = renderHook(() => useNoticiaMutation());

    act(() => {
      void result.current.criar({ titulo: 'Título', descricao: 'Descrição' });
    });

    expect(result.current.salvando).toBe(true);

    act(() => {
      resolver(noticia);
    });

    await waitFor(() => expect(result.current.salvando).toBe(false));
  });
});
