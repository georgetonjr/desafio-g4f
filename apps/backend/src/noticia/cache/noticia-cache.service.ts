import { Injectable } from '@nestjs/common';
import { NoticiaPaginada } from '../repository/noticia.repository.interface';

const TTL_MS = 30_000;

@Injectable()
export class NoticiaCacheService {
  private readonly cache = new Map<
    string,
    { value: NoticiaPaginada; expiresAt: number }
  >();
  private version = 0;

  getVersion(): number {
    return this.version;
  }

  get(key: string): NoticiaPaginada | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      return undefined;
    }
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: NoticiaPaginada, versionAtFetch: number): void {
    if (versionAtFetch !== this.version) {
      return;
    }
    this.cache.set(key, { value, expiresAt: Date.now() + TTL_MS });
  }

  invalidate(): void {
    this.version += 1;
    this.cache.clear();
  }
}
