import { ImportSession } from '../types/import.types';

export interface IImportSessionRepository {
  create(session: ImportSession): Promise<void>;
  findById(id: string): Promise<ImportSession | null>;
  update(id: string, session: ImportSession): Promise<void>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
  cleanupExpired(): Promise<void>;
}

class InMemoryImportSessionRepository implements IImportSessionRepository {
  private store = new Map<string, ImportSession>();

  async create(session: ImportSession): Promise<void> {
    this.store.set(session.id, session);
  }

  async findById(id: string): Promise<ImportSession | null> {
    const session = this.store.get(id);
    if (!session) return null;

    // Check expiration on read
    if (new Date() > new Date(session.expiresAt)) {
      this.store.delete(id);
      return null;
    }

    return session;
  }

  async update(id: string, session: ImportSession): Promise<void> {
    this.store.set(id, session);
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    const session = await this.findById(id);
    return !!session;
  }

  async cleanupExpired(): Promise<void> {
    const now = new Date();
    for (const [key, session] of this.store.entries()) {
      if (now > new Date(session.expiresAt)) {
        this.store.delete(key);
      }
    }
  }
}

export const importSessionRepository = new InMemoryImportSessionRepository();

// Run TTL cleanup every 10 minutes
setInterval(() => {
  importSessionRepository.cleanupExpired().catch(console.error);
}, 10 * 60 * 1000);
