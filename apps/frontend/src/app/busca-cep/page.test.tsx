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

describe('Funcionalidade: Busca de CEP', () => {
  beforeEach(() => {
    vi.mocked(buscarEnderecoPorCep).mockReset();
  });

  it('dado um CEP válido existente, quando o usuário busca, então o endereço é exibido', async () => {
    // Dado
    vi.mocked(buscarEnderecoPorCep).mockResolvedValueOnce({
      cep: '01001-000',
      logradouro: 'Praça da Sé',
      bairro: 'Sé',
      localidade: 'São Paulo',
      uf: 'SP',
    });
    const usuario = userEvent.setup();
    render(<PaginaBuscaCep />);

    // Quando
    await usuario.type(screen.getByLabelText(/cep/i), '01001000');
    await usuario.click(screen.getByRole('button', { name: /buscar/i }));

    // Então
    await waitFor(() =>
      expect(screen.getByText('Praça da Sé')).toBeInTheDocument(),
    );
    expect(screen.getByText(/São Paulo/)).toBeInTheDocument();
  });

  it('dado um CEP inexistente, quando o usuário busca, então uma mensagem de erro é exibida', async () => {
    // Dado
    vi.mocked(buscarEnderecoPorCep).mockRejectedValueOnce(
      new ErroBuscaCep('CEP não encontrado.'),
    );
    const usuario = userEvent.setup();
    render(<PaginaBuscaCep />);

    // Quando
    await usuario.type(screen.getByLabelText(/cep/i), '00000000');
    await usuario.click(screen.getByRole('button', { name: /buscar/i }));

    // Então
    await waitFor(() =>
      expect(screen.getByText('CEP não encontrado.')).toBeInTheDocument(),
    );
  });

  it('dado um CEP com formato inválido, quando a página é exibida, então o botão de busca permanece desabilitado', () => {
    // Dado / Quando
    render(<PaginaBuscaCep />);

    // Então
    expect(screen.getByRole('button', { name: /buscar/i })).toBeDisabled();
  });
});
