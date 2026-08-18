export function resolved<T>(valor: () => T): Promise<T> {
  return Promise.resolve(valor());
}
