import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Noticia } from '../noticia.entity';
import { NoticiaTypeOrmRepository } from './noticia.typeorm-repository';

describe('NoticiaTypeOrmRepository', () => {
  let repository: NoticiaTypeOrmRepository;
  let ormRepository: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOneBy: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoticiaTypeOrmRepository,
        {
          provide: getRepositoryToken(Noticia),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOneBy: jest.fn(),
            delete: jest.fn(),
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
});
