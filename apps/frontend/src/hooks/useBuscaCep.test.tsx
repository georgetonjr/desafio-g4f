import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useBuscaCep } from './useBuscaCep';
import { buscarEnderecoPorCep, ErroBuscaCep } from '../services/servicoCep';

vi.mock('../services/servicoCep', async () => {
  const modulo = await vi.importActual<typeof import('../services/servicoCep')>(
    '../services/servicoCep',
  );
  return {
    ...modulo,
    buscarEnderecoPorCep: vi.fn(),
  };
});

describe('useBuscaCep', () => {
  beforeEach(() => {
    vi.mocked(buscarEnderecoPorCep).mockReset();
  });

  it('define carregando como true durante a busca e false ao final', async () => {
    let resolver: (
      endereco: Awaited<ReturnType<typeof buscarEnderecoPorCep>>,
    ) => void = () => {};
    vi.mocked(buscarEnderecoPorCep).mockReturnValueOnce(
      new Promise((resolve) => {
        resolver = resolve;
      }),
    );

    const { result } = renderHook(() => useBuscaCep());

    act(() => {
      void result.current.buscar('01001000');
    });

    expect(result.current.carregando).toBe(true);

    act(() => {
      resolver({
        cep: '01001-000',
        logradouro: 'Praça da Sé',
        bairro: 'Sé',
        localidade: 'São Paulo',
        uf: 'SP',
      });
    });

    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.endereco?.localidade).toBe('São Paulo');
    expect(result.current.erro).toBeNull();
  });

  it('define a mensagem de erro quando a busca falha', async () => {
    vi.mocked(buscarEnderecoPorCep).mockRejectedValueOnce(
      new ErroBuscaCep('CEP não encontrado.'),
    );

    const { result } = renderHook(() => useBuscaCep());

    await act(async () => {
      await result.current.buscar('00000000');
    });

    expect(result.current.erro).toBe('CEP não encontrado.');
    expect(result.current.endereco).toBeNull();
  });
});
