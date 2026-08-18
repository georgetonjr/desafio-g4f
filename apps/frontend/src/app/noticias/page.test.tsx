import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaginaNoticias from './page';
import {
  listarNoticias,
  criarNoticia,
  atualizarNoticia,
  removerNoticia,
  ErroNoticia,
} from '../../services/servicoNoticia';

vi.mock('../../services/servicoNoticia', async () => {
  const modulo = await vi.importActual<
    typeof import('../../services/servicoNoticia')
  >('../../services/servicoNoticia');
  return {
    ...modulo,
    listarNoticias: vi.fn(),
    criarNoticia: vi.fn(),
    atualizarNoticia: vi.fn(),
    removerNoticia: vi.fn(),
  };
});

const noticia = {
  id: '1',
  titulo: 'Eleições municipais',
  descricao: 'Cobertura local',
  criadoEm: '2026-08-18T00:00:00.000Z',
  atualizadoEm: '2026-08-18T00:00:00.000Z',
};

function paginaListagem(itens = [noticia], overrides = {}) {
  return {
    itens,
    total: itens.length,
    pagina: 1,
    limite: 10,
    totalPaginas: 1,
    ...overrides,
  };
}

describe('PaginaNoticias', () => {
  beforeEach(() => {
    vi.mocked(listarNoticias).mockReset();
    vi.mocked(criarNoticia).mockReset();
    vi.mocked(atualizarNoticia).mockReset();
    vi.mocked(removerNoticia).mockReset();
  });

  it('exibe a lista de notícias carregada', async () => {
    vi.mocked(listarNoticias).mockResolvedValueOnce(paginaListagem());

    render(<PaginaNoticias />);

    await waitFor(() =>
      expect(screen.getByText('Eleições municipais')).toBeInTheDocument(),
    );
    expect(screen.getByText('Cobertura local')).toBeInTheDocument();
  });

  it('cria uma notícia a partir do formulário', async () => {
    vi.mocked(listarNoticias)
      .mockResolvedValueOnce(paginaListagem([]))
      .mockResolvedValueOnce(paginaListagem());
    vi.mocked(criarNoticia).mockResolvedValueOnce(noticia);

    const usuario = userEvent.setup();
    render(<PaginaNoticias />);

    await waitFor(() =>
      expect(
        screen.getByText('Nenhuma notícia encontrada.'),
      ).toBeInTheDocument(),
    );

    await usuario.type(screen.getByLabelText(/título/i), 'Eleições municipais');
    await usuario.type(screen.getByLabelText(/descrição/i), 'Cobertura local');
    await usuario.click(screen.getByRole('button', { name: /criar/i }));

    await waitFor(() =>
      expect(criarNoticia).toHaveBeenCalledWith({
        titulo: 'Eleições municipais',
        descricao: 'Cobertura local',
      }),
    );
  });

  it('edita uma notícia existente', async () => {
    vi.mocked(listarNoticias).mockResolvedValue(paginaListagem());
    vi.mocked(atualizarNoticia).mockResolvedValueOnce({
      ...noticia,
      titulo: 'Eleições atualizadas',
    });

    const usuario = userEvent.setup();
    render(<PaginaNoticias />);

    await waitFor(() =>
      expect(screen.getByText('Eleições municipais')).toBeInTheDocument(),
    );

    await usuario.click(screen.getByRole('button', { name: /editar/i }));
    const campoTitulo = screen.getByLabelText(/título/i);
    await usuario.clear(campoTitulo);
    await usuario.type(campoTitulo, 'Eleições atualizadas');
    await usuario.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() =>
      expect(atualizarNoticia).toHaveBeenCalledWith('1', {
        titulo: 'Eleições atualizadas',
        descricao: 'Cobertura local',
      }),
    );
  });

  it('remove uma notícia', async () => {
    vi.mocked(listarNoticias).mockResolvedValue(paginaListagem());
    vi.mocked(removerNoticia).mockResolvedValueOnce(undefined);

    const usuario = userEvent.setup();
    render(<PaginaNoticias />);

    await waitFor(() =>
      expect(screen.getByText('Eleições municipais')).toBeInTheDocument(),
    );

    await usuario.click(screen.getByRole('button', { name: /remover/i }));

    await waitFor(() => expect(removerNoticia).toHaveBeenCalledWith('1'));
  });

  it('exibe mensagem de erro quando a listagem falha', async () => {
    vi.mocked(listarNoticias).mockRejectedValueOnce(
      new ErroNoticia('Não foi possível carregar as notícias.'),
    );

    render(<PaginaNoticias />);

    await waitFor(() =>
      expect(
        screen.getByText('Não foi possível carregar as notícias.'),
      ).toBeInTheDocument(),
    );
  });

  it('navega para a próxima página', async () => {
    vi.mocked(listarNoticias).mockResolvedValue(
      paginaListagem([noticia], { totalPaginas: 2, total: 11 }),
    );

    const usuario = userEvent.setup();
    render(<PaginaNoticias />);

    await waitFor(() =>
      expect(screen.getByText('Eleições municipais')).toBeInTheDocument(),
    );

    await usuario.click(screen.getByRole('button', { name: /próxima/i }));

    await waitFor(() =>
      expect(listarNoticias).toHaveBeenLastCalledWith({
        pagina: 2,
        limite: 10,
        busca: undefined,
      }),
    );
  });

  it('filtra notícias por busca', async () => {
    vi.mocked(listarNoticias).mockResolvedValue(paginaListagem());

    const usuario = userEvent.setup();
    render(<PaginaNoticias />);

    await waitFor(() =>
      expect(screen.getByText('Eleições municipais')).toBeInTheDocument(),
    );

    await usuario.type(screen.getByLabelText(/buscar/i), 'eleições');
    await usuario.click(screen.getByRole('button', { name: /^buscar$/i }));

    await waitFor(() =>
      expect(listarNoticias).toHaveBeenLastCalledWith({
        pagina: 1,
        limite: 10,
        busca: 'eleições',
      }),
    );
  });
});
