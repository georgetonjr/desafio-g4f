import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useNoticias } from './useNoticias';
import { listarNoticias, ErroNoticia } from '../services/servicoNoticia';

vi.mock('../services/servicoNoticia', async () => {
  const modulo = await vi.importActual<
    typeof import('../services/servicoNoticia')
  >('../services/servicoNoticia');
  return {
    ...modulo,
    listarNoticias: vi.fn(),
  };
});

const noticia = {
  id: '1',
  titulo: 'Eleições municipais',
  descricao: 'Cobertura local',
  criadoEm: '2026-08-18T00:00:00.000Z',
  atualizadoEm: '2026-08-18T00:00:00.000Z',
};

describe('useNoticias', () => {
  beforeEach(() => {
    vi.mocked(listarNoticias).mockReset();
  });

  it('carrega a listagem ao montar', async () => {
    vi.mocked(listarNoticias).mockResolvedValueOnce({
      itens: [noticia],
      total: 1,
      pagina: 1,
      limite: 10,
      totalPaginas: 1,
    });

    const { result } = renderHook(() => useNoticias());

    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.itens).toEqual([noticia]);
    expect(result.current.total).toBe(1);
    expect(listarNoticias).toHaveBeenCalledWith({
      pagina: 1,
      limite: 10,
      busca: undefined,
    });
  });

  it('recarrega ao mudar de página', async () => {
    vi.mocked(listarNoticias).mockResolvedValue({
      itens: [noticia],
      total: 1,
      pagina: 1,
      limite: 10,
      totalPaginas: 2,
    });

    const { result } = renderHook(() => useNoticias());
    await waitFor(() => expect(result.current.carregando).toBe(false));

    act(() => {
      result.current.irParaPagina(2);
    });

    await waitFor(() =>
      expect(listarNoticias).toHaveBeenLastCalledWith({
        pagina: 2,
        limite: 10,
        busca: undefined,
      }),
    );
  });

  it('reseta para a página 1 ao definir uma busca', async () => {
    vi.mocked(listarNoticias).mockResolvedValue({
      itens: [noticia],
      total: 1,
      pagina: 1,
      limite: 10,
      totalPaginas: 1,
    });

    const { result } = renderHook(() => useNoticias());
    await waitFor(() => expect(result.current.carregando).toBe(false));

    act(() => {
      result.current.irParaPagina(2);
    });
    await waitFor(() => expect(result.current.pagina).toBe(2));

    act(() => {
      result.current.definirBusca('eleições');
    });

    expect(result.current.pagina).toBe(1);
    await waitFor(() =>
      expect(listarNoticias).toHaveBeenLastCalledWith({
        pagina: 1,
        limite: 10,
        busca: 'eleições',
      }),
    );
  });

  it('define a mensagem de erro quando a listagem falha', async () => {
    vi.mocked(listarNoticias).mockRejectedValueOnce(
      new ErroNoticia('Não foi possível carregar as notícias.'),
    );

    const { result } = renderHook(() => useNoticias());

    await waitFor(() =>
      expect(result.current.erro).toBe(
        'Não foi possível carregar as notícias.',
      ),
    );
    expect(result.current.carregando).toBe(false);
  });
});
