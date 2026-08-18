import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaginaBuscaCep from './page';
import { buscarEnderecoPorCep, ErroBuscaCep } from '../../services/servicoCep';

vi.mock('../../services/servicoCep', async () => {
  const modulo = await vi.importActual<
    typeof import('../../services/servicoCep')
  >('../../services/servicoCep');
  return {
    ...modulo,
    buscarEnderecoPorCep: vi.fn(),
  };
});

describe('PaginaBuscaCep', () => {
  beforeEach(() => {
    vi.mocked(buscarEnderecoPorCep).mockReset();
  });

  it('exibe o endereço retornado após a busca', async () => {
    vi.mocked(buscarEnderecoPorCep).mockResolvedValueOnce({
      cep: '01001-000',
      logradouro: 'Praça da Sé',
      bairro: 'Sé',
      localidade: 'São Paulo',
      uf: 'SP',
    });

    const usuario = userEvent.setup();
    render(<PaginaBuscaCep />);

    await usuario.type(screen.getByLabelText(/cep/i), '01001000');
    await usuario.click(screen.getByRole('button', { name: /buscar/i }));

    await waitFor(() =>
      expect(screen.getByText('Praça da Sé')).toBeInTheDocument(),
    );
    expect(screen.getByText(/São Paulo/)).toBeInTheDocument();
  });

  it('exibe mensagem de erro quando o CEP não é encontrado', async () => {
    vi.mocked(buscarEnderecoPorCep).mockRejectedValueOnce(
      new ErroBuscaCep('CEP não encontrado.'),
    );

    const usuario = userEvent.setup();
    render(<PaginaBuscaCep />);

    await usuario.type(screen.getByLabelText(/cep/i), '00000000');
    await usuario.click(screen.getByRole('button', { name: /buscar/i }));

    await waitFor(() =>
      expect(screen.getByText('CEP não encontrado.')).toBeInTheDocument(),
    );
  });

  it('mantém o botão desabilitado enquanto o CEP é inválido', () => {
    render(<PaginaBuscaCep />);

    expect(screen.getByRole('button', { name: /buscar/i })).toBeDisabled();
  });
});
