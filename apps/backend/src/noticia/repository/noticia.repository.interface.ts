import { Noticia } from '../noticia.entity';

export const NOTICIA_REPOSITORY = Symbol('NOTICIA_REPOSITORY');

export type NoticiaInput = {
  titulo: string;
  descricao: string;
};

export interface NoticiaRepository {
  criar(dados: NoticiaInput): Promise<Noticia>;
  listarTodas(): Promise<Array<Noticia>>;
  buscarPorId(id: string): Promise<Noticia | null>;
  atualizar(id: string, dados: Partial<NoticiaInput>): Promise<Noticia | null>;
  remover(id: string): Promise<boolean>;
}
