export function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, '');
}

export function formatarCep(valor: string): string {
  const digitos = apenasDigitos(valor).slice(0, 8);

  if (digitos.length <= 5) {
    return digitos;
  }

  return `${digitos.slice(0, 5)}-${digitos.slice(5)}`;
}

export function cepEhValido(valor: string): boolean {
  return apenasDigitos(valor).length === 8;
}
