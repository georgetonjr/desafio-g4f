import { listarNoticiasQuerySchema } from './listar-noticias-query.schema';

describe('listarNoticiasQuerySchema', () => {
  it('aplica os defaults quando nenhum parâmetro é informado', () => {
    const resultado = listarNoticiasQuerySchema.parse({});

    expect(resultado).toEqual({ pagina: 1, limite: 10 });
  });

  it('faz coerção de pagina e limite recebidos como string', () => {
    const resultado = listarNoticiasQuerySchema.parse({
      pagina: '2',
      limite: '20',
    });

    expect(resultado).toEqual({ pagina: 2, limite: 20 });
  });

  it('aceita busca preenchida', () => {
    const resultado = listarNoticiasQuerySchema.safeParse({ busca: 'teste' });

    expect(resultado.success).toBe(true);
  });

  it('rejeita pagina menor que 1', () => {
    const resultado = listarNoticiasQuerySchema.safeParse({ pagina: 0 });

    expect(resultado.success).toBe(false);
  });

  it('rejeita limite maior que 100', () => {
    const resultado = listarNoticiasQuerySchema.safeParse({ limite: 101 });

    expect(resultado.success).toBe(false);
  });

  it('rejeita busca vazia', () => {
    const resultado = listarNoticiasQuerySchema.safeParse({ busca: '' });

    expect(resultado.success).toBe(false);
  });
});
