import { describe, expect, it } from 'vitest';
import { apenasDigitos, cepEhValido, formatarCep } from './cep';

describe('apenasDigitos', () => {
  it('remove tudo que não é dígito', () => {
    expect(apenasDigitos('01001-000')).toBe('01001000');
  });
});

describe('formatarCep', () => {
  it('aplica a máscara com até 8 dígitos', () => {
    expect(formatarCep('01001000')).toBe('01001-000');
  });

  it('não quebra com entrada parcial', () => {
    expect(formatarCep('0100')).toBe('0100');
  });

  it('ignora dígitos além do nono caractere', () => {
    expect(formatarCep('010010001234')).toBe('01001-000');
  });
});

describe('cepEhValido', () => {
  it('retorna true para 8 dígitos', () => {
    expect(cepEhValido('01001-000')).toBe(true);
  });

  it('retorna false para menos de 8 dígitos', () => {
    expect(cepEhValido('0100')).toBe(false);
  });
});
