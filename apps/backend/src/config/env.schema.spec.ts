import { envSchema } from './env.schema';

describe('envSchema', () => {
  const envValido = {
    DB_HOST: 'localhost',
    DB_PORT: '5432',
    DB_USER: 'noticia_user',
    DB_PASSWORD: 'noticia_password',
    DB_NAME: 'noticia_db',
  };

  it('aceita um .env válido e converte DB_PORT/PORT para number', () => {
    const resultado = envSchema.parse(envValido);

    expect(resultado.DB_PORT).toBe(5432);
    expect(resultado.PORT).toBe(3000);
  });

  it('assume NODE_ENV como "dev" quando não informado', () => {
    const resultado = envSchema.parse(envValido);

    expect(resultado.NODE_ENV).toBe('dev');
  });

  it('rejeita quando falta DB_HOST', () => {
    const envSemHost: Record<string, unknown> = { ...envValido };
    delete envSemHost.DB_HOST;

    expect(() => envSchema.parse(envSemHost)).toThrow();
  });

  it('rejeita quando DB_PORT não é numérico', () => {
    expect(() =>
      envSchema.parse({ ...envValido, DB_PORT: 'nao-numerico' }),
    ).toThrow();
  });
});
