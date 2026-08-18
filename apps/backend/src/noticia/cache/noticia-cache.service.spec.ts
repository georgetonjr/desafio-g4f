import { NoticiaCacheService } from './noticia-cache.service';

describe('NoticiaCacheService', () => {
  let cache: NoticiaCacheService;

  beforeEach(() => {
    cache = new NoticiaCacheService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('retorna undefined quando a chave não está em cache', () => {
    expect(cache.get('chave')).toBeUndefined();
  });

  it('retorna o valor cacheado dentro do TTL', () => {
    const version = cache.getVersion();
    cache.set('chave', { itens: [], total: 0 }, version);

    expect(cache.get('chave')).toEqual({ itens: [], total: 0 });
  });

  it('expira o valor após o TTL', () => {
    const agora = Date.now();
    const version = cache.getVersion();
    cache.set('chave', { itens: [], total: 0 }, version);

    jest.spyOn(Date, 'now').mockReturnValue(agora + 31_000);

    expect(cache.get('chave')).toBeUndefined();
  });

  it('invalidate limpa as entradas já cacheadas', () => {
    const version = cache.getVersion();
    cache.set('chave', { itens: [], total: 0 }, version);

    cache.invalidate();

    expect(cache.get('chave')).toBeUndefined();
  });

  it('descarta um set cuja versão ficou desatualizada por uma invalidação concorrente', () => {
    const versionAtFetch = cache.getVersion();

    cache.invalidate();
    cache.set('chave', { itens: [], total: 0 }, versionAtFetch);

    expect(cache.get('chave')).toBeUndefined();
  });
});
