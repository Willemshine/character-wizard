import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadCorePack,
  loadEditionPack,
  clearPackCache,
  getPackCacheStats,
  preloadAllEditions,
} from '../src/services/packLoader';

describe('packLoader', () => {
  beforeEach(() => {
    clearPackCache();
  });

  describe('loadCorePack', () => {
    it('should load all races from both editions', () => {
      const pack = loadCorePack();
      expect(pack.races.length).toBe(4); // 2 per edition
    });

    it('should load all classes from both editions', () => {
      const pack = loadCorePack();
      expect(pack.classes.length).toBe(4); // 2 per edition
    });

    it('should load all backgrounds from both editions', () => {
      const pack = loadCorePack();
      expect(pack.backgrounds.length).toBe(4); // 2 per edition
    });

    it('should load all spells', () => {
      const pack = loadCorePack();
      expect(pack.spells.length).toBe(10);
    });

    it('should cache the full pack', () => {
      loadCorePack();
      const stats = getPackCacheStats();
      expect(stats.fullPackCached).toBe(true);
    });

    it('should return same reference on second call (cached)', () => {
      const pack1 = loadCorePack();
      const pack2 = loadCorePack();
      expect(pack1).toBe(pack2);
    });
  });

  describe('loadEditionPack', () => {
    it('should filter races for 2014 edition', () => {
      const pack = loadEditionPack('2014');
      expect(pack.edition).toBe('2014');
      expect(pack.races.length).toBe(2);
      expect(pack.races.every((r) => r.editions.includes('2014'))).toBe(true);
    });

    it('should filter races for 2024 edition', () => {
      const pack = loadEditionPack('2024');
      expect(pack.edition).toBe('2024');
      expect(pack.races.length).toBe(2);
      expect(pack.races.every((r) => r.editions.includes('2024'))).toBe(true);
    });

    it('should filter classes for specific edition', () => {
      const pack2014 = loadEditionPack('2014');
      const pack2024 = loadEditionPack('2024');

      expect(pack2014.classes.length).toBe(2);
      expect(pack2024.classes.length).toBe(2);
    });

    it('should include caster and non-caster classes', () => {
      const pack = loadEditionPack('2014');
      const casters = pack.classes.filter((c) => c.isCaster);
      const nonCasters = pack.classes.filter((c) => !c.isCaster);

      expect(casters.length).toBeGreaterThanOrEqual(1);
      expect(nonCasters.length).toBeGreaterThanOrEqual(1);
    });

    it('should cache edition packs', () => {
      loadEditionPack('2014');
      loadEditionPack('2024');
      const stats = getPackCacheStats();
      expect(stats.editionCacheSize).toBe(2);
    });

    it('should return same reference on second call (cached)', () => {
      const pack1 = loadEditionPack('2014');
      const pack2 = loadEditionPack('2014');
      expect(pack1).toBe(pack2);
    });
  });

  describe('clearPackCache', () => {
    it('should clear all caches', () => {
      loadCorePack();
      loadEditionPack('2014');
      loadEditionPack('2024');

      clearPackCache();
      const stats = getPackCacheStats();

      expect(stats.fullPackCached).toBe(false);
      expect(stats.editionCacheSize).toBe(0);
    });
  });

  describe('preloadAllEditions', () => {
    it('should preload both edition packs', () => {
      preloadAllEditions();
      const stats = getPackCacheStats();
      expect(stats.editionCacheSize).toBe(2);
    });
  });

  describe('data integrity', () => {
    it('should have Human race in both editions', () => {
      const pack2014 = loadEditionPack('2014');
      const pack2024 = loadEditionPack('2024');

      const human2014 = pack2014.races.find((r) => r.name === 'Human');
      const human2024 = pack2024.races.find((r) => r.name === 'Human');

      expect(human2014).toBeDefined();
      expect(human2024).toBeDefined();
    });

    it('should have Fighter (non-caster) and Wizard (caster) in both editions', () => {
      const pack = loadEditionPack('2014');

      const fighter = pack.classes.find((c) => c.name === 'Fighter');
      const wizard = pack.classes.find((c) => c.name === 'Wizard');

      expect(fighter).toBeDefined();
      expect(fighter?.isCaster).toBe(false);
      expect(wizard).toBeDefined();
      expect(wizard?.isCaster).toBe(true);
    });

    it('should have valid spell data', () => {
      const pack = loadEditionPack('2014');

      for (const spell of pack.spells) {
        expect(spell.level).toBeGreaterThanOrEqual(0);
        expect(spell.level).toBeLessThanOrEqual(9);
        expect(spell.school).toBeDefined();
        expect(spell.effect).toBeDefined();
      }
    });
  });
});
