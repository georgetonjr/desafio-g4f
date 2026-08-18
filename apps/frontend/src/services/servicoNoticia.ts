import axios from 'axios';

const URL_BASE_API =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:9000/api';

export interface Noticia {
  id: string;
  titulo: string;
  descricao: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface NoticiasPaginadas {
  itens: Noticia[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export interface FiltroListagemNoticias {
  pagina?: number;
  limite?: number;
  busca?: string;
}

export interface DadosNoticia {
  titulo: string;
  descricao: string;
}

export class ErroNoticia extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = 'ErroNoticia';
  }
}

export async function listarNoticias(
  filtro: FiltroListagemNoticias = {},
): Promise<NoticiasPaginadas> {
  try {
    const resposta = await axios.get<NoticiasPaginadas>(
      `${URL_BASE_API}/noticias`,
      { params: filtro },
    );
    return resposta.data;
  } catch {
    throw new ErroNoticia('Não foi possível carregar as notícias.');
  }
}

export async function criarNoticia(dados: DadosNoticia): Promise<Noticia> {
  try {
    const resposta = await axios.post<Noticia>(
      `${URL_BASE_API}/noticias`,
      dados,
    );
    return resposta.data;
  } catch {
    throw new ErroNoticia('Não foi possível criar a notícia.');
  }
}

export async function atualizarNoticia(
  id: string,
  dados: Partial<DadosNoticia>,
): Promise<Noticia> {
  try {
    const resposta = await axios.patch<Noticia>(
      `${URL_BASE_API}/noticias/${id}`,
      dados,
    );
    return resposta.data;
  } catch {
    throw new ErroNoticia('Não foi possível atualizar a notícia.');
  }
}

export async function removerNoticia(id: string): Promise<void> {
  try {
    await axios.delete(`${URL_BASE_API}/noticias/${id}`);
  } catch {
    throw new ErroNoticia('Não foi possível remover a notícia.');
  }
}
