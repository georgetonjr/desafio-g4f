import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Noticia } from '../noticia.entity';
import { NoticiaTypeOrmRepository } from './noticia.typeorm-repository';

describe('NoticiaTypeOrmRepository', () => {
  let repository: NoticiaTypeOrmRepository;
  let ormRepository: {
    create: jest.Mock;
    save: jest.Mock;
    findOneBy: jest.Mock;
    delete: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let queryBuilder: {
    where: jest.Mock;
    skip: jest.Mock;
    take: jest.Mock;
    getManyAndCount: jest.Mock;
  };

  beforeEach(async () => {
    queryBuilder = {
      where: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoticiaTypeOrmRepository,
        {
          provide: getRepositoryToken(Noticia),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
          },
        },
      ],
    }).compile();

    repository = module.get(NoticiaTypeOrmRepository);
    ormRepository = module.get(getRepositoryToken(Noticia));
  });

  it('criar deve chamar create e save do Repository do TypeORM', async () => {
    const dados = { titulo: 'Título', descricao: 'Descrição' };
    const noticiaCriada = { id: '1', ...dados } as Noticia;
    ormRepository.create.mockReturnValue(noticiaCriada);
    ormRepository.save.mockResolvedValue(noticiaCriada);

    const resultado = await repository.criar(dados);

    expect(ormRepository.create).toHaveBeenCalledWith(dados);
    expect(ormRepository.save).toHaveBeenCalledWith(noticiaCriada);
    expect(resultado).toEqual(noticiaCriada);
  });

  it('buscarPorId deve retornar null quando não encontrada', async () => {
    ormRepository.findOneBy.mockResolvedValue(null);

    const resultado = await repository.buscarPorId('id-inexistente');

    expect(resultado).toBeNull();
  });

  it('listar deve paginar com skip e take e retornar itens e total', async () => {
    const itens = [{ id: '1' } as Noticia];
    queryBuilder.getManyAndCount.mockResolvedValue([itens, 1]);

    const resultado = await repository.listar({ pagina: 2, limite: 5 });

    expect(queryBuilder.skip).toHaveBeenCalledWith(5);
    expect(queryBuilder.take).toHaveBeenCalledWith(5);
    expect(queryBuilder.where).not.toHaveBeenCalled();
    expect(resultado).toEqual({ itens, total: 1 });
  });

  it('listar deve aplicar filtro de busca em titulo ou descricao', async () => {
    queryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    await repository.listar({ pagina: 1, limite: 10, busca: 'teste' });

    expect(queryBuilder.where).toHaveBeenCalled();
  });
});
