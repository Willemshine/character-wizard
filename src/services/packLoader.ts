import type { Edition, Race, CharacterClass, Background, Spell, Equipment } from '../types';
import { races } from '../data/races';
import { classes } from '../data/classes';
import { backgrounds } from '../data/backgrounds';
import { spells } from '../data/spells';
import { equipment } from '../data/equipment';

/**
 * Core pack data structure
 */
export interface CorePack {
  races: Race[];
  classes: CharacterClass[];
  backgrounds: Background[];
  spells: Spell[];
  equipment: Equipment[];
}

/**
 * Edition-filtered core pack
 */
export interface EditionPack extends CorePack {
  edition: Edition;
}

/**
 * Cache for loaded packs
 */
const packCache = new Map<string, EditionPack>();

/**
 * Cache for the full unfiltered pack
 */
let fullPackCache: CorePack | null = null;

/**
 * Load the full core pack (all editions)
 * Uses caching for performance
 */
export function loadCorePack(): CorePack {
  if (fullPackCache) {
    return fullPackCache;
  }

  fullPackCache = {
    races,
    classes,
    backgrounds,
    spells,
    equipment,
  };

  return fullPackCache;
}

/**
 * Load core pack filtered for a specific edition
 * Uses caching for performance
 * @param edition - The edition to filter for
 */
export function loadEditionPack(edition: Edition): EditionPack {
  const cacheKey = `edition-${edition}`;

  const cached = packCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const fullPack = loadCorePack();

  const editionPack: EditionPack = {
    edition,
    races: fullPack.races.filter((r) => r.editions.includes(edition)),
    classes: fullPack.classes.filter((c) => c.editions.includes(edition)),
    backgrounds: fullPack.backgrounds.filter((b) => b.editions.includes(edition)),
    spells: fullPack.spells.filter((s) => s.editions.includes(edition)),
    equipment: fullPack.equipment.filter((e) => e.editions.includes(edition)),
  };

  packCache.set(cacheKey, editionPack);

  return editionPack;
}

/**
 * Clear all cached packs
 * Useful for testing or when data is updated dynamically
 */
export function clearPackCache(): void {
  packCache.clear();
  fullPackCache = null;
}

/**
 * Get cache statistics
 */
export function getPackCacheStats(): { editionCacheSize: number; fullPackCached: boolean } {
  return {
    editionCacheSize: packCache.size,
    fullPackCached: fullPackCache !== null,
  };
}

/**
 * Preload all edition packs into cache
 * Useful for applications that will use multiple editions
 */
export function preloadAllEditions(): void {
  loadEditionPack('2014');
  loadEditionPack('2024');
}

export default {
  loadCorePack,
  loadEditionPack,
  clearPackCache,
  getPackCacheStats,
  preloadAllEditions,
};
