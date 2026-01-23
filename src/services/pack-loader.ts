import type {
  ModulePack,
  ModuleMetadata,
  ModuleRace,
  ModuleSubrace,
  ModuleClass,
  ModuleSubclass,
  ModuleBackground,
  ModuleFeat,
  ModuleSpell,
  ModuleEquipment,
  ModuleTrait,
} from '../types/index.ts';
import type { Edition } from '../types/character.ts';
import { normalizePack } from '../types/module.ts';
import { persistence } from './persistence.ts';
import { store } from '../store/store.ts';

const PACKS_PATH = './packs';

const BUILT_IN_PACKS = ['core-5e.json', 'core-5e-2024.json'];

/**
 * Cache entry with data and timestamp
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  edition?: Edition;
}

/**
 * Cache configuration
 */
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

class PackLoader {
  private loadedPacks: Map<string, ModulePack> = new Map();

  // Caches for content queries
  private cache: {
    races: CacheEntry<ModuleRace[]> | null;
    subraces: CacheEntry<ModuleSubrace[]> | null;
    classes: CacheEntry<ModuleClass[]> | null;
    subclasses: CacheEntry<ModuleSubclass[]> | null;
    backgrounds: CacheEntry<ModuleBackground[]> | null;
    feats: CacheEntry<ModuleFeat[]> | null;
    spells: CacheEntry<ModuleSpell[]> | null;
    equipment: CacheEntry<ModuleEquipment[]> | null;
    traits: CacheEntry<ModuleTrait[]> | null;
  } = {
    races: null,
    subraces: null,
    classes: null,
    subclasses: null,
    backgrounds: null,
    feats: null,
    spells: null,
    equipment: null,
    traits: null,
  };

  async init(): Promise<void> {
    await this.loadBuiltInPacks();
    await this.loadUploadedPacks();
    await this.syncModuleMetadata();
  }

  private async loadBuiltInPacks(): Promise<void> {
    for (const filename of BUILT_IN_PACKS) {
      try {
        const pack = await this.fetchPack(`${PACKS_PATH}/${filename}`);
        if (pack) {
          this.loadedPacks.set(pack.manifest.id, pack);
        }
      } catch (error) {
        console.warn(`Failed to load built-in pack: ${filename}`, error);
      }
    }
  }

  private async loadUploadedPacks(): Promise<void> {
    const uploadedPacks = await persistence.getUploadedPacks();
    for (const pack of uploadedPacks) {
      const normalized = normalizePack(pack);
      this.loadedPacks.set(normalized.manifest.id, normalized);
    }
  }

  private async fetchPack(url: string): Promise<ModulePack | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      return normalizePack(data);
    } catch (error) {
      console.error(`Failed to fetch pack from ${url}:`, error);
      return null;
    }
  }

  private async syncModuleMetadata(): Promise<void> {
    const existingMetadata = await persistence.getModuleMetadata();
    const existingMap = new Map(existingMetadata.map((m) => [m.id, m]));

    const modules: ModuleMetadata[] = [];

    for (const pack of this.loadedPacks.values()) {
      const packId = pack.manifest.id;
      const existing = existingMap.get(packId);
      const isBuiltIn = BUILT_IN_PACKS.some(
        (f) => f.replace('.json', '') === packId || packId.startsWith('core-')
      );

      modules.push({
        id: packId,
        name: pack.manifest.name,
        version: pack.manifest.version,
        description: pack.manifest.description,
        enabled: existing?.enabled ?? true,
        isBuiltIn,
        isUploaded: !isBuiltIn,
      });
    }

    await persistence.saveModuleMetadata(modules);
    store.setModules(modules);
    store.setLoadedPacks(Array.from(this.loadedPacks.values()));
  }

  /**
   * Invalidate all caches - call when packs change
   */
  invalidateCache(): void {
    this.cache = {
      races: null,
      subraces: null,
      classes: null,
      subclasses: null,
      backgrounds: null,
      feats: null,
      spells: null,
      equipment: null,
      traits: null,
    };
  }

  /**
   * Check if a cache entry is valid
   */
  private isCacheValid<T>(entry: CacheEntry<T> | null, edition?: Edition): boolean {
    if (!entry) return false;
    if (Date.now() - entry.timestamp > CACHE_TTL) return false;
    if (entry.edition !== edition) return false;
    return true;
  }

  async uploadPack(file: File): Promise<ModulePack> {
    const text = await file.text();
    const rawPack = JSON.parse(text);
    const pack = normalizePack(rawPack);

    if (!pack.manifest.id || !pack.manifest.name || !pack.manifest.version) {
      throw new Error('Invalid pack format: missing required fields (id, name, version)');
    }

    await persistence.saveUploadedPack(pack);
    this.loadedPacks.set(pack.manifest.id, pack);
    this.invalidateCache();
    await this.syncModuleMetadata();

    return pack;
  }

  async removePack(packId: string): Promise<void> {
    const modules = store.get('modules');
    const module = modules.find((m) => m.id === packId);

    if (module?.isBuiltIn) {
      throw new Error('Cannot remove built-in packs');
    }

    await persistence.deleteUploadedPack(packId);
    this.loadedPacks.delete(packId);
    this.invalidateCache();
    await this.syncModuleMetadata();
  }

  async togglePack(packId: string, enabled: boolean): Promise<void> {
    store.toggleModule(packId, enabled);
    const modules = store.get('modules');
    this.invalidateCache();
    await persistence.saveModuleMetadata(modules);
  }

  getPack(packId: string): ModulePack | undefined {
    return this.loadedPacks.get(packId);
  }

  getEnabledPacks(): ModulePack[] {
    const modules = store.get('modules');
    const enabledIds = new Set(modules.filter((m) => m.enabled).map((m) => m.id));
    return Array.from(this.loadedPacks.values()).filter((p) =>
      enabledIds.has(p.manifest.id)
    );
  }

  /**
   * Get enabled packs filtered by edition
   * - Packs with matching edition are included
   * - Packs without an edition specified are included (universal packs)
   * - 'custom' edition includes all packs
   */
  getEnabledPacksForEdition(edition?: Edition): ModulePack[] {
    const enabledPacks = this.getEnabledPacks();

    if (!edition || edition === 'custom') {
      return enabledPacks;
    }

    return enabledPacks.filter((pack) => {
      const packEdition = pack.manifest.edition;
      // Include packs that either match the edition or have no edition (universal)
      return !packEdition || packEdition === edition || packEdition === 'custom';
    });
  }

  /**
   * Get all races, optionally filtered by edition
   */
  getAllRaces(edition?: Edition): ModuleRace[] {
    if (this.isCacheValid(this.cache.races, edition)) {
      return this.cache.races!.data;
    }

    const packs = this.getEnabledPacksForEdition(edition);
    const data = packs.flatMap((p) => p.content.races ?? []);

    this.cache.races = { data, timestamp: Date.now(), edition };
    return data;
  }

  /**
   * Get all subraces, optionally filtered by edition
   */
  getAllSubraces(edition?: Edition): ModuleSubrace[] {
    if (this.isCacheValid(this.cache.subraces, edition)) {
      return this.cache.subraces!.data;
    }

    const packs = this.getEnabledPacksForEdition(edition);
    const data = packs.flatMap((p) => p.content.subraces ?? []);

    this.cache.subraces = { data, timestamp: Date.now(), edition };
    return data;
  }

  /**
   * Get subraces for a specific race, optionally filtered by edition
   */
  getSubracesForRace(raceId: string, edition?: Edition): ModuleSubrace[] {
    return this.getAllSubraces(edition).filter((s) => s.parentRaceId === raceId);
  }

  /**
   * Get all classes, optionally filtered by edition
   */
  getAllClasses(edition?: Edition): ModuleClass[] {
    if (this.isCacheValid(this.cache.classes, edition)) {
      return this.cache.classes!.data;
    }

    const packs = this.getEnabledPacksForEdition(edition);
    const data = packs.flatMap((p) => p.content.classes ?? []);

    this.cache.classes = { data, timestamp: Date.now(), edition };
    return data;
  }

  /**
   * Get all subclasses, optionally filtered by edition
   */
  getAllSubclasses(edition?: Edition): ModuleSubclass[] {
    if (this.isCacheValid(this.cache.subclasses, edition)) {
      return this.cache.subclasses!.data;
    }

    const packs = this.getEnabledPacksForEdition(edition);
    const data = packs.flatMap((p) => p.content.subclasses ?? []);

    this.cache.subclasses = { data, timestamp: Date.now(), edition };
    return data;
  }

  /**
   * Get subclasses for a specific class, optionally filtered by edition
   */
  getSubclassesForClass(classId: string, edition?: Edition): ModuleSubclass[] {
    return this.getAllSubclasses(edition).filter((s) => s.parentClassId === classId);
  }

  /**
   * Get all backgrounds, optionally filtered by edition
   */
  getAllBackgrounds(edition?: Edition): ModuleBackground[] {
    if (this.isCacheValid(this.cache.backgrounds, edition)) {
      return this.cache.backgrounds!.data;
    }

    const packs = this.getEnabledPacksForEdition(edition);
    const data = packs.flatMap((p) => p.content.backgrounds ?? []);

    this.cache.backgrounds = { data, timestamp: Date.now(), edition };
    return data;
  }

  /**
   * Get all feats, optionally filtered by edition
   */
  getAllFeats(edition?: Edition): ModuleFeat[] {
    if (this.isCacheValid(this.cache.feats, edition)) {
      return this.cache.feats!.data;
    }

    const packs = this.getEnabledPacksForEdition(edition);
    const data = packs.flatMap((p) => p.content.feats ?? []);

    this.cache.feats = { data, timestamp: Date.now(), edition };
    return data;
  }

  /**
   * Get all spells, optionally filtered by edition
   */
  getAllSpells(edition?: Edition): ModuleSpell[] {
    if (this.isCacheValid(this.cache.spells, edition)) {
      return this.cache.spells!.data;
    }

    const packs = this.getEnabledPacksForEdition(edition);
    const data = packs.flatMap((p) => p.content.spells ?? []);

    this.cache.spells = { data, timestamp: Date.now(), edition };
    return data;
  }

  /**
   * Get all equipment, optionally filtered by edition
   */
  getAllEquipment(edition?: Edition): ModuleEquipment[] {
    if (this.isCacheValid(this.cache.equipment, edition)) {
      return this.cache.equipment!.data;
    }

    const packs = this.getEnabledPacksForEdition(edition);
    const data = packs.flatMap((p) => p.content.equipment ?? []);

    this.cache.equipment = { data, timestamp: Date.now(), edition };
    return data;
  }

  /**
   * Get all traits, optionally filtered by edition
   */
  getAllTraits(edition?: Edition): ModuleTrait[] {
    if (this.isCacheValid(this.cache.traits, edition)) {
      return this.cache.traits!.data;
    }

    const packs = this.getEnabledPacksForEdition(edition);
    const data = packs.flatMap((p) => p.content.traits ?? []);

    this.cache.traits = { data, timestamp: Date.now(), edition };
    return data;
  }

  /**
   * Get a race by ID, optionally filtered by edition
   */
  getRaceById(raceId: string, edition?: Edition): ModuleRace | undefined {
    return this.getAllRaces(edition).find((r) => r.id === raceId);
  }

  /**
   * Get a class by ID, optionally filtered by edition
   */
  getClassById(classId: string, edition?: Edition): ModuleClass | undefined {
    return this.getAllClasses(edition).find((c) => c.id === classId);
  }

  /**
   * Get a background by ID, optionally filtered by edition
   */
  getBackgroundById(backgroundId: string, edition?: Edition): ModuleBackground | undefined {
    return this.getAllBackgrounds(edition).find((b) => b.id === backgroundId);
  }

  /**
   * Get a spell by ID, optionally filtered by edition
   */
  getSpellById(spellId: string, edition?: Edition): ModuleSpell | undefined {
    return this.getAllSpells(edition).find((s) => s.id === spellId);
  }

  /**
   * Get equipment by ID, optionally filtered by edition
   */
  getEquipmentById(equipmentId: string, edition?: Edition): ModuleEquipment | undefined {
    return this.getAllEquipment(edition).find((e) => e.id === equipmentId);
  }

  /**
   * Get spells filtered by class, optionally filtered by edition
   */
  getSpellsForClass(classId: string, edition?: Edition): ModuleSpell[] {
    return this.getAllSpells(edition).filter((s) => s.classes.includes(classId));
  }

  /**
   * Get spells filtered by level, optionally filtered by edition
   */
  getSpellsByLevel(level: number, edition?: Edition): ModuleSpell[] {
    return this.getAllSpells(edition).filter((s) => s.level === level);
  }

  /**
   * Get cantrips (level 0 spells), optionally filtered by edition
   */
  getCantrips(edition?: Edition): ModuleSpell[] {
    return this.getSpellsByLevel(0, edition);
  }
}

export const packLoader = new PackLoader();
