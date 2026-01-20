import { openDB, type IDBPDatabase } from 'idb';
import type { Character, CharacterSummary, ModuleMetadata, ModulePack } from '../types/index.ts';

const DB_NAME = 'character-wizard';
const DB_VERSION = 1;

interface AppSettings {
  lastOpenedCharacterId: string | null;
}

interface CharacterWizardDB {
  characters: {
    key: string;
    value: Character;
    indexes: { 'by-updated': string };
  };
  modules: {
    key: string;
    value: ModuleMetadata;
  };
  uploadedPacks: {
    key: string;
    value: ModulePack;
  };
  settings: {
    key: string;
    value: AppSettings;
  };
}

class PersistenceService {
  private db: IDBPDatabase<CharacterWizardDB> | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.openDatabase();
    return this.initPromise;
  }

  private async openDatabase(): Promise<void> {
    this.db = await openDB<CharacterWizardDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('characters')) {
          const characterStore = db.createObjectStore('characters', { keyPath: 'id' });
          characterStore.createIndex('by-updated', 'updatedAt');
        }

        if (!db.objectStoreNames.contains('modules')) {
          db.createObjectStore('modules', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('uploadedPacks')) {
          db.createObjectStore('uploadedPacks', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
      },
    });
  }

  private async ensureDb(): Promise<IDBPDatabase<CharacterWizardDB>> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  async saveCharacter(character: Character): Promise<void> {
    const db = await this.ensureDb();
    character.updatedAt = new Date().toISOString();
    await db.put('characters', character);
  }

  async getCharacter(id: string): Promise<Character | undefined> {
    const db = await this.ensureDb();
    return db.get('characters', id);
  }

  async getAllCharacters(): Promise<CharacterSummary[]> {
    const db = await this.ensureDb();
    const characters = await db.getAllFromIndex('characters', 'by-updated');

    return characters.reverse().map((c) => ({
      id: c.id,
      name: c.name,
      race: c.race,
      class: c.class,
      level: c.level,
      updatedAt: c.updatedAt,
    }));
  }

  async deleteCharacter(id: string): Promise<void> {
    const db = await this.ensureDb();
    await db.delete('characters', id);
  }

  async saveModuleMetadata(modules: ModuleMetadata[]): Promise<void> {
    const db = await this.ensureDb();
    const tx = db.transaction('modules', 'readwrite');
    await tx.store.clear();
    await Promise.all(modules.map((m) => tx.store.put(m)));
    await tx.done;
  }

  async getModuleMetadata(): Promise<ModuleMetadata[]> {
    const db = await this.ensureDb();
    return db.getAll('modules');
  }

  async saveUploadedPack(pack: ModulePack): Promise<void> {
    const db = await this.ensureDb();
    await db.put('uploadedPacks', pack);
  }

  async getUploadedPacks(): Promise<ModulePack[]> {
    const db = await this.ensureDb();
    return db.getAll('uploadedPacks');
  }

  async deleteUploadedPack(id: string): Promise<void> {
    const db = await this.ensureDb();
    await db.delete('uploadedPacks', id);
  }

  async setLastOpenedCharacter(characterId: string | null): Promise<void> {
    const db = await this.ensureDb();
    const settings = (await db.get('settings', 'app')) || { lastOpenedCharacterId: null };
    settings.lastOpenedCharacterId = characterId;
    await db.put('settings', settings, 'app');
  }

  async getLastOpenedCharacter(): Promise<string | null> {
    const db = await this.ensureDb();
    const settings = await db.get('settings', 'app');
    return settings?.lastOpenedCharacterId ?? null;
  }

  async exportCharacter(id: string): Promise<string | null> {
    const character = await this.getCharacter(id);
    if (!character) return null;
    return JSON.stringify(character, null, 2);
  }

  async importCharacter(json: string): Promise<Character> {
    const character = JSON.parse(json) as Character;
    character.id = crypto.randomUUID();
    character.createdAt = new Date().toISOString();
    character.updatedAt = new Date().toISOString();
    await this.saveCharacter(character);
    return character;
  }
}

export const persistence = new PersistenceService();
