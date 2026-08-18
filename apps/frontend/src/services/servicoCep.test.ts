import { describe, expect, it, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { buscarEnderecoPorCep, ErroBuscaCep } from './servicoCep';

vi.mock('axios');

describe('buscarEnderecoPorCep', () => {
  beforeEach(() => {
    vi.mocked(axios.get).mockReset();
  });

  it('retorna o endereço quando o CEP existe', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: {
        cep: '01001-000',
        logradouro: 'Praça da Sé',
        bairro: 'Sé',
        localidade: 'São Paulo',
        uf: 'SP',
      },
    });

    const endereco = await buscarEnderecoPorCep('01001000');

    expect(endereco).toEqual({
      cep: '01001-000',
      logradouro: 'Praça da Sé',
      bairro: 'Sé',
      localidade: 'São Paulo',
      uf: 'SP',
    });
    expect(axios.get).toHaveBeenCalledWith(
      'https://viacep.com.br/ws/01001000/json/',
    );
  });

  it('lança ErroBuscaCep quando o CEP não existe', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: { erro: true } });

    await expect(buscarEnderecoPorCep('00000000')).rejects.toThrow(
      ErroBuscaCep,
    );
  });

  it('lança ErroBuscaCep quando a requisição falha', async () => {
    vi.mocked(axios.get).mockRejectedValueOnce(new Error('falha de rede'));

    await expect(buscarEnderecoPorCep('01001000')).rejects.toThrow(
      ErroBuscaCep,
    );
  });
});
