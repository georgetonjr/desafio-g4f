import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Noticia } from '../noticia.entity';
import {
  ListarNoticiasInput,
  NoticiaInput,
  NoticiaPaginada,
  NoticiaRepository,
} from './noticia.repository.interface';

@Injectable()
export class NoticiaTypeOrmRepository implements NoticiaRepository {
  constructor(
    @InjectRepository(Noticia) private readonly repo: Repository<Noticia>,
  ) {}

  async criar(dados: NoticiaInput): Promise<Noticia> {
    const noticia = this.repo.create(dados);
    return this.repo.save(noticia);
  }

  async listar({
    pagina,
    limite,
    busca,
  }: ListarNoticiasInput): Promise<NoticiaPaginada> {
    const query = this.repo.createQueryBuilder('noticia');

    if (busca) {
      query.where(
        new Brackets((qb) => {
          qb.where('noticia.titulo ILIKE :busca', {
            busca: `%${busca}%`,
          }).orWhere('noticia.descricao ILIKE :busca', {
            busca: `%${busca}%`,
          });
        }),
      );
    }

    const [itens, total] = await query
      .skip((pagina - 1) * limite)
      .take(limite)
      .getManyAndCount();

    return { itens, total };
  }

  async buscarPorId(id: string): Promise<Noticia | null> {
    return this.repo.findOneBy({ id });
  }

  async atualizar(
    id: string,
    dados: Partial<NoticiaInput>,
  ): Promise<Noticia | null> {
    const noticia = await this.buscarPorId(id);
    if (!noticia) {
      return null;
    }
    Object.assign(noticia, dados);
    return this.repo.save(noticia);
  }

  async remover(id: string): Promise<boolean> {
    const resultado = await this.repo.delete(id);
    return (resultado.affected ?? 0) > 0;
  }
}
