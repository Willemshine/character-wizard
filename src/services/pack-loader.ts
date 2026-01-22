import type { ModulePack, ModuleMetadata } from '../types/index.ts';
import { normalizePack } from '../types/module.ts';
import { persistence } from './persistence.ts';
import { store } from '../store/store.ts';

const PACKS_PATH = './packs';

const BUILT_IN_PACKS = ['core.json'];

class PackLoader {
  private loadedPacks: Map<string, ModulePack> = new Map();

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
        (f) => f.replace('.json', '') === packId || packId === 'core'
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

  async uploadPack(file: File): Promise<ModulePack> {
    const text = await file.text();
    const rawPack = JSON.parse(text);
    const pack = normalizePack(rawPack);

    if (!pack.manifest.id || !pack.manifest.name || !pack.manifest.version) {
      throw new Error('Invalid pack format: missing required fields (id, name, version)');
    }

    await persistence.saveUploadedPack(pack);
    this.loadedPacks.set(pack.manifest.id, pack);
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
    await this.syncModuleMetadata();
  }

  async togglePack(packId: string, enabled: boolean): Promise<void> {
    store.toggleModule(packId, enabled);
    const modules = store.get('modules');
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

  getAllRaces() {
    return this.getEnabledPacks().flatMap((p) => p.content.races ?? []);
  }

  getAllSubraces() {
    return this.getEnabledPacks().flatMap((p) => p.content.subraces ?? []);
  }

  getSubracesForRace(raceId: string) {
    return this.getAllSubraces().filter((s) => s.parentRaceId === raceId);
  }

  getAllClasses() {
    return this.getEnabledPacks().flatMap((p) => p.content.classes ?? []);
  }

  getAllSubclasses() {
    return this.getEnabledPacks().flatMap((p) => p.content.subclasses ?? []);
  }

  getSubclassesForClass(classId: string) {
    return this.getAllSubclasses().filter((s) => s.parentClassId === classId);
  }

  getAllBackgrounds() {
    return this.getEnabledPacks().flatMap((p) => p.content.backgrounds ?? []);
  }

  getAllFeats() {
    return this.getEnabledPacks().flatMap((p) => p.content.feats ?? []);
  }

  getAllSpells() {
    return this.getEnabledPacks().flatMap((p) => p.content.spells ?? []);
  }

  getAllEquipment() {
    return this.getEnabledPacks().flatMap((p) => p.content.equipment ?? []);
  }

  getAllTraits() {
    return this.getEnabledPacks().flatMap((p) => p.content.traits ?? []);
  }
}

export const packLoader = new PackLoader();
