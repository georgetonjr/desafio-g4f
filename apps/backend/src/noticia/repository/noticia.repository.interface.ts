import { Noticia } from '../noticia.entity';

export const NOTICIA_REPOSITORY = Symbol('NOTICIA_REPOSITORY');

export type NoticiaInput = {
  titulo: string;
  descricao: string;
};

export type ListarNoticiasInput = {
  pagina: number;
  limite: number;
  busca?: string;
};

export type NoticiaPaginada = {
  itens: Noticia[];
  total: number;
};

export interface NoticiaRepository {
  criar(dados: NoticiaInput): Promise<Noticia>;
  listar(dados: ListarNoticiasInput): Promise<NoticiaPaginada>;
  buscarPorId(id: string): Promise<Noticia | null>;
  atualizar(id: string, dados: Partial<NoticiaInput>): Promise<Noticia | null>;
  remover(id: string): Promise<boolean>;
}
