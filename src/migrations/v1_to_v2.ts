/**
 * Migration: Schema Version 1 -> 2
 *
 * Example migration demonstrating the pattern.
 * This migration adds support for multiclassing tracking.
 *
 * Changes:
 * - Add `isMulticlass` flag to meta
 * - Add `primaryClassIndex` to selections
 * - Add `hitDiceUsed` to derived stats
 */

import type { Migration } from './types.js';
import { registry } from './migrator.js';

// Type definitions for v1 schema (what we're migrating FROM)
interface CharacterStateV1 {
  schemaVersion: 1;
  appVersion: string;
  meta: {
    id: string;
    name: string;
    edition: string;
    level: number;
    createdAt: string;
    updatedAt: string;
  };
  selections: {
    race?: { raceId: string; subraceId?: string; customName?: string };
    classes: Array<{ classId: string; subclassId?: string; level: number }>;
    background?: { backgroundId: string; customizations?: Record<string, string> };
    abilityScores?: {
      method: string;
      baseScores: Record<string, number>;
      bonuses: Record<string, number>;
    };
    proficiencies: Array<{ type: string; id: string; source: string; level?: string }>;
    equipment: { items: Array<{ itemId: string; quantity: number; equipped: boolean; source: string }>; startingGold?: number };
    traits: Array<{ traitId: string; choiceId: string; selectedOptionId?: string; source: string }>;
    spells: Array<{ spellId: string; prepared: boolean; source: string; castingType?: string }>;
  };
  derived: Record<string, unknown>;
  enabledModules: Array<{ moduleId: string; version: string }>;
}

// Type definitions for v2 schema (what we're migrating TO)
interface CharacterStateV2 {
  schemaVersion: 2;
  appVersion: string;
  meta: {
    id: string;
    name: string;
    edition: string;
    level: number;
    createdAt: string;
    updatedAt: string;
    isMulticlass: boolean;
  };
  selections: {
    race?: { raceId: string; subraceId?: string; customName?: string };
    classes: Array<{ classId: string; subclassId?: string; level: number }>;
    primaryClassIndex: number;
    background?: { backgroundId: string; customizations?: Record<string, string> };
    abilityScores?: {
      method: string;
      baseScores: Record<string, number>;
      bonuses: Record<string, number>;
    };
    proficiencies: Array<{ type: string; id: string; source: string; level?: string }>;
    equipment: { items: Array<{ itemId: string; quantity: number; equipped: boolean; source: string }>; startingGold?: number };
    traits: Array<{ traitId: string; choiceId: string; selectedOptionId?: string; source: string }>;
    spells: Array<{ spellId: string; prepared: boolean; source: string; castingType?: string }>;
  };
  derived: Record<string, unknown> & {
    hitDiceUsed: Record<string, number>;
  };
  enabledModules: Array<{ moduleId: string; version: string }>;
}

const migration: Migration<CharacterStateV1, CharacterStateV2> = {
  fromVersion: 1,
  toVersion: 2,
  description: 'Add multiclassing support with primary class tracking and hit dice usage',

  validate(data: unknown): data is CharacterStateV1 {
    if (!data || typeof data !== 'object') return false;
    const d = data as Record<string, unknown>;
    return d.schemaVersion === 1 && typeof d.meta === 'object';
  },

  migrate(data: CharacterStateV1): CharacterStateV2 {
    const isMulticlass = data.selections.classes.length > 1;

    // Build hit dice usage tracker (all classes start with 0 used)
    const hitDiceUsed: Record<string, number> = {};
    for (const cls of data.selections.classes) {
      hitDiceUsed[cls.classId] = 0;
    }

    return {
      ...data,
      schemaVersion: 2,
      meta: {
        ...data.meta,
        updatedAt: new Date().toISOString(),
        isMulticlass,
      },
      selections: {
        ...data.selections,
        primaryClassIndex: 0, // First class is primary by default
      },
      derived: {
        ...data.derived,
        hitDiceUsed,
      },
    };
  },
};

// Register the migration
registry.register(migration);

export default migration;
