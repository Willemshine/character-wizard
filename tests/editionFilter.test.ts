import { describe, it, expect } from 'vitest';
import {
  filterByEdition,
  filterByName,
  findById,
  filterContent,
  filterRaces,
  filterClasses,
  filterBackgrounds,
  filterSpells,
  filterEquipment,
} from '../src/services/editionFilter';
import { races } from '../src/data/races';
import { classes } from '../src/data/classes';
import { backgrounds } from '../src/data/backgrounds';
import { spells } from '../src/data/spells';
import { equipment } from '../src/data/equipment';

describe('editionFilter', () => {
  describe('filterByEdition', () => {
    it('should filter races by 2014 edition', () => {
      const result = filterByEdition(races, '2014');
      expect(result.length).toBe(2);
      expect(result.every((r) => r.editions.includes('2014'))).toBe(true);
    });

    it('should filter races by 2024 edition', () => {
      const result = filterByEdition(races, '2024');
      expect(result.length).toBe(2);
      expect(result.every((r) => r.editions.includes('2024'))).toBe(true);
    });

    it('should filter spells available in both editions', () => {
      const result2014 = filterByEdition(spells, '2014');
      const result2024 = filterByEdition(spells, '2024');
      expect(result2014.length).toBe(10);
      expect(result2024.length).toBe(10);
    });
  });

  describe('filterByName', () => {
    it('should filter by partial name match', () => {
      const result = filterByName(races, 'elf');
      expect(result.length).toBe(2); // Elf 2014 and Elf 2024
    });

    it('should be case-insensitive', () => {
      const result = filterByName(races, 'HUMAN');
      expect(result.length).toBe(2);
    });
  });

  describe('findById', () => {
    it('should find race by exact id', () => {
      const result = findById(races, 'human-2014');
      expect(result).toBeDefined();
      expect(result?.name).toBe('Human');
    });

    it('should return undefined for non-existent id', () => {
      const result = findById(races, 'non-existent');
      expect(result).toBeUndefined();
    });
  });

  describe('filterContent', () => {
    it('should combine edition and name filters', () => {
      const result = filterContent(races, '2014', { name: 'Human' });
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('human-2014');
    });

    it('should filter by id', () => {
      const result = filterContent(races, '2024', { id: 'elf-2024' });
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Elf');
    });
  });

  describe('filterRaces', () => {
    it('should filter by darkvision', () => {
      const withDarkvision = filterRaces(races, '2014', { hasDarkvision: true });
      const withoutDarkvision = filterRaces(races, '2014', { hasDarkvision: false });

      expect(withDarkvision.every((r) => r.darkvision > 0)).toBe(true);
      expect(withoutDarkvision.every((r) => r.darkvision === 0)).toBe(true);
    });

    it('should filter by size', () => {
      const mediumRaces = filterRaces(races, '2014', { size: 'Medium' });
      expect(mediumRaces.every((r) => r.size === 'Medium')).toBe(true);
    });
  });

  describe('filterClasses', () => {
    it('should filter by caster status', () => {
      const casters = filterClasses(classes, '2014', { isCaster: true });
      const nonCasters = filterClasses(classes, '2014', { isCaster: false });

      expect(casters.length).toBeGreaterThanOrEqual(1);
      expect(casters.every((c) => c.isCaster)).toBe(true);
      expect(nonCasters.length).toBeGreaterThanOrEqual(1);
      expect(nonCasters.every((c) => !c.isCaster)).toBe(true);
    });

    it('should filter by primary ability', () => {
      const intClasses = filterClasses(classes, '2014', { primaryAbility: 'intelligence' });
      expect(intClasses.every((c) => c.primaryAbility === 'intelligence')).toBe(true);
    });

    it('should filter by hit die', () => {
      const d10Classes = filterClasses(classes, '2014', { hitDie: 10 });
      expect(d10Classes.every((c) => c.hitDie === 10)).toBe(true);
    });
  });

  describe('filterBackgrounds', () => {
    it('should filter by skill proficiency', () => {
      const religionBackgrounds = filterBackgrounds(backgrounds, '2014', {
        hasSkill: 'Religion',
      });
      expect(religionBackgrounds.length).toBeGreaterThanOrEqual(1);
      expect(
        religionBackgrounds.every((b) =>
          b.skillProficiencies.some((s) => s.toLowerCase() === 'religion')
        )
      ).toBe(true);
    });
  });

  describe('filterSpells', () => {
    it('should filter cantrips', () => {
      const cantrips = filterSpells(spells, '2014', { cantripsOnly: true });
      expect(cantrips.every((s) => s.level === 0)).toBe(true);
    });

    it('should filter by spell level', () => {
      const level1 = filterSpells(spells, '2014', { level: 1 });
      expect(level1.every((s) => s.level === 1)).toBe(true);
    });

    it('should filter by school', () => {
      const evocation = filterSpells(spells, '2014', { school: 'Evocation' });
      expect(evocation.every((s) => s.school === 'Evocation')).toBe(true);
    });

    it('should filter by class', () => {
      const wizardSpells = filterSpells(spells, '2014', { forClass: 'Wizard' });
      expect(
        wizardSpells.every((s) =>
          s.classes.some((c) => c.toLowerCase() === 'wizard')
        )
      ).toBe(true);
    });

    it('should filter ritual spells', () => {
      const rituals = filterSpells(spells, '2014', { isRitual: true });
      expect(rituals.every((s) => s.ritual)).toBe(true);
    });
  });

  describe('filterEquipment', () => {
    it('should filter by category', () => {
      const weapons = filterEquipment(equipment, '2014', { category: 'weapon' });
      expect(weapons.every((e) => e.category === 'weapon')).toBe(true);
    });

    it('should filter by max cost', () => {
      const cheap = filterEquipment(equipment, '2014', { maxCost: 10 });
      expect(cheap.every((e) => e.cost <= 10)).toBe(true);
    });
  });

  describe('2024 edition differences', () => {
    it('should have flexible ability bonuses in 2024 races', () => {
      const races2024 = filterRaces(races, '2024', {});
      expect(races2024.every((r) => r.flexibleAbilityBonuses === true)).toBe(true);
    });

    it('should have fixed ability bonuses in 2014 races', () => {
      const races2014 = filterRaces(races, '2014', {});
      const human2014 = races2014.find((r) => r.name === 'Human');
      expect(human2014?.flexibleAbilityBonuses).toBeUndefined();
      expect(Object.keys(human2014?.abilityBonuses || {}).length).toBeGreaterThan(0);
    });

    it('should have ability bonuses in 2024 backgrounds', () => {
      const backgrounds2024 = filterBackgrounds(backgrounds, '2024', {});
      expect(
        backgrounds2024.every(
          (b) => b.abilityBonuses && Object.keys(b.abilityBonuses).length > 0
        )
      ).toBe(true);
    });
  });
});
