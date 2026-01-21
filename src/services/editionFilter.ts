import type {
  Edition,
  EditionContent,
  Race,
  CharacterClass,
  Background,
  Spell,
  Equipment,
} from '../types';

/**
 * Filter options for edition-aware queries
 */
export interface FilterOptions {
  /** Search by name (case-insensitive partial match) */
  name?: string;
  /** Filter by id */
  id?: string;
}

/**
 * Filter any edition-aware content list by edition
 * @param items - Array of edition-aware content
 * @param edition - Edition to filter for
 * @returns Filtered array
 */
export function filterByEdition<T extends EditionContent>(
  items: T[],
  edition: Edition
): T[] {
  return items.filter((item) => item.editions.includes(edition));
}

/**
 * Filter content by name (case-insensitive partial match)
 * @param items - Array of content with name property
 * @param searchName - Name to search for
 * @returns Filtered array
 */
export function filterByName<T extends { name: string }>(
  items: T[],
  searchName: string
): T[] {
  const lowerSearch = searchName.toLowerCase();
  return items.filter((item) => item.name.toLowerCase().includes(lowerSearch));
}

/**
 * Find content by exact id
 * @param items - Array of content with id property
 * @param id - Exact id to find
 * @returns Found item or undefined
 */
export function findById<T extends { id: string }>(
  items: T[],
  id: string
): T | undefined {
  return items.find((item) => item.id === id);
}

/**
 * Combined filter function
 * @param items - Array of edition-aware content
 * @param edition - Edition to filter for
 * @param options - Additional filter options
 * @returns Filtered array
 */
export function filterContent<T extends EditionContent>(
  items: T[],
  edition: Edition,
  options?: FilterOptions
): T[] {
  let result = filterByEdition(items, edition);

  if (options?.name) {
    result = filterByName(result, options.name);
  }

  if (options?.id) {
    const found = result.find((item) => item.id === options.id);
    result = found ? [found] : [];
  }

  return result;
}

// === Specialized filter functions for each content type ===

/**
 * Filter races by edition and optional criteria
 */
export function filterRaces(
  races: Race[],
  edition: Edition,
  options?: FilterOptions & {
    /** Filter by size */
    size?: Race['size'];
    /** Filter by darkvision (true = has darkvision) */
    hasDarkvision?: boolean;
  }
): Race[] {
  let result = filterContent(races, edition, options);

  if (options?.size) {
    result = result.filter((r) => r.size === options.size);
  }

  if (options?.hasDarkvision !== undefined) {
    result = result.filter((r) =>
      options.hasDarkvision ? r.darkvision > 0 : r.darkvision === 0
    );
  }

  return result;
}

/**
 * Filter classes by edition and optional criteria
 */
export function filterClasses(
  classes: CharacterClass[],
  edition: Edition,
  options?: FilterOptions & {
    /** Filter by caster status */
    isCaster?: boolean;
    /** Filter by hit die size */
    hitDie?: CharacterClass['hitDie'];
    /** Filter by primary ability */
    primaryAbility?: CharacterClass['primaryAbility'];
  }
): CharacterClass[] {
  let result = filterContent(classes, edition, options);

  if (options?.isCaster !== undefined) {
    result = result.filter((c) => c.isCaster === options.isCaster);
  }

  if (options?.hitDie) {
    result = result.filter((c) => c.hitDie === options.hitDie);
  }

  if (options?.primaryAbility) {
    result = result.filter((c) => c.primaryAbility === options.primaryAbility);
  }

  return result;
}

/**
 * Filter backgrounds by edition and optional criteria
 */
export function filterBackgrounds(
  backgrounds: Background[],
  edition: Edition,
  options?: FilterOptions & {
    /** Filter by skill proficiency */
    hasSkill?: string;
  }
): Background[] {
  let result = filterContent(backgrounds, edition, options);

  if (options?.hasSkill) {
    const skillLower = options.hasSkill.toLowerCase();
    result = result.filter((b) =>
      b.skillProficiencies.some((s) => s.toLowerCase() === skillLower)
    );
  }

  return result;
}

/**
 * Filter spells by edition and optional criteria
 */
export function filterSpells(
  spells: Spell[],
  edition: Edition,
  options?: FilterOptions & {
    /** Filter by spell level */
    level?: Spell['level'];
    /** Filter by school */
    school?: Spell['school'];
    /** Filter by class that can cast it */
    forClass?: string;
    /** Filter by ritual status */
    isRitual?: boolean;
    /** Filter by cantrips only */
    cantripsOnly?: boolean;
  }
): Spell[] {
  let result = filterContent(spells, edition, options);

  if (options?.level !== undefined) {
    result = result.filter((s) => s.level === options.level);
  }

  if (options?.cantripsOnly) {
    result = result.filter((s) => s.level === 0);
  }

  if (options?.school) {
    result = result.filter((s) => s.school === options.school);
  }

  if (options?.forClass) {
    const classLower = options.forClass.toLowerCase();
    result = result.filter((s) =>
      s.classes.some((c) => c.toLowerCase() === classLower)
    );
  }

  if (options?.isRitual !== undefined) {
    result = result.filter((s) => s.ritual === options.isRitual);
  }

  return result;
}

/**
 * Filter equipment by edition and optional criteria
 */
export function filterEquipment(
  equipment: Equipment[],
  edition: Edition,
  options?: FilterOptions & {
    /** Filter by category */
    category?: Equipment['category'];
    /** Filter by max cost */
    maxCost?: number;
  }
): Equipment[] {
  let result = filterContent(equipment, edition, options);

  if (options?.category) {
    result = result.filter((e) => e.category === options.category);
  }

  if (options?.maxCost !== undefined) {
    result = result.filter((e) => e.cost <= options.maxCost!);
  }

  return result;
}

export default {
  filterByEdition,
  filterByName,
  findById,
  filterContent,
  filterRaces,
  filterClasses,
  filterBackgrounds,
  filterSpells,
  filterEquipment,
};
