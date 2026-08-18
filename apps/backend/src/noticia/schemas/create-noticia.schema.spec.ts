import { createNoticiaSchema } from './create-noticia.schema';

describe('createNoticiaSchema', () => {
  it('aceita um payload com titulo e descricao preenchidos', () => {
    const resultado = createNoticiaSchema.safeParse({
      titulo: 'Título válido',
      descricao: 'Descrição válida',
    });

    expect(resultado.success).toBe(true);
  });

  it('rejeita um payload sem titulo', () => {
    const resultado = createNoticiaSchema.safeParse({
      descricao: 'Descrição válida',
    });

    expect(resultado.success).toBe(false);
  });

  it('rejeita titulo vazio', () => {
    const resultado = createNoticiaSchema.safeParse({
      titulo: '',
      descricao: 'Descrição válida',
    });

    expect(resultado.success).toBe(false);
  });
});
