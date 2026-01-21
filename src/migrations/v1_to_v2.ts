/**
 * Migration: v1 -> v2
 *
 * Migrates from the legacy flat Character format to the new CharacterState format
 * with selections, derived stats, and module support.
 */

import { registerMigration } from './index.ts';
import type { AbilityScores, SkillName } from '../types/character.ts';
import {
  createEmptySelections,
  createEmptyDerivedStats,
  calculateModifier,
  calculateProficiencyBonus,
  SKILL_NAMES,
  SKILL_ABILITY_MAP,
} from '../types/character.ts';

/**
 * V1 Character format (legacy)
 */
interface V1Character {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  background: string;
  abilityScores: AbilityScores;
  hitPoints: number;
  maxHitPoints: number;
  armorClass: number;
  proficiencyBonus: number;
  skills: string[];
  equipment: string[];
  features: string[];
  spells?: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Maps legacy skill names to new SkillName format
 * Handles variations like "Animal Handling" -> "animalHandling"
 */
function normalizeSkillName(skill: string): SkillName | null {
  const normalized = skill
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/-/g, '');

  const mapping: Record<string, SkillName> = {
    acrobatics: 'acrobatics',
    animalhandling: 'animalHandling',
    arcana: 'arcana',
    athletics: 'athletics',
    deception: 'deception',
    history: 'history',
    insight: 'insight',
    intimidation: 'intimidation',
    investigation: 'investigation',
    medicine: 'medicine',
    nature: 'nature',
    perception: 'perception',
    performance: 'performance',
    persuasion: 'persuasion',
    religion: 'religion',
    sleightofhand: 'sleightOfHand',
    stealth: 'stealth',
    survival: 'survival',
  };

  return mapping[normalized] ?? null;
}

/**
 * Convert legacy ID format to new lowercase-hyphen format
 */
function normalizeId(id: string): string {
  return id
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Migration function: v1 -> v2
 */
function migrateV1ToV2(data: unknown): unknown {
  const v1 = data as V1Character;

  // Build ability modifiers
  const abilityModifiers = {
    strength: calculateModifier(v1.abilityScores.strength),
    dexterity: calculateModifier(v1.abilityScores.dexterity),
    constitution: calculateModifier(v1.abilityScores.constitution),
    intelligence: calculateModifier(v1.abilityScores.intelligence),
    wisdom: calculateModifier(v1.abilityScores.wisdom),
    charisma: calculateModifier(v1.abilityScores.charisma),
  };

  // Normalize and map skill proficiencies
  const proficientSkills = v1.skills
    .map(normalizeSkillName)
    .filter((s): s is SkillName => s !== null);

  // Calculate skill modifiers
  const proficiencyBonus = calculateProficiencyBonus(v1.level);
  const skillModifiers: Record<SkillName, number> = {} as Record<SkillName, number>;

  for (const skill of SKILL_NAMES) {
    const abilityMod = abilityModifiers[SKILL_ABILITY_MAP[skill]];
    const isProficient = proficientSkills.includes(skill);
    skillModifiers[skill] = abilityMod + (isProficient ? proficiencyBonus : 0);
  }

  // Build selections from v1 data
  const selections = createEmptySelections();

  // Race selection
  if (v1.race) {
    selections.race = {
      raceId: normalizeId(v1.race),
      traitChoices: {},
    };
  }

  // Class selection
  if (v1.class) {
    selections.class = {
      classId: normalizeId(v1.class),
    };
  }

  // Background selection
  if (v1.background) {
    selections.background = {
      backgroundId: normalizeId(v1.background),
      customizations: {},
    };
  }

  // Ability scores (assume manual entry for migrated characters)
  selections.abilityScores = {
    method: 'manual',
    baseScores: { ...v1.abilityScores },
    racialBonuses: {},
    miscBonuses: {},
  };

  // Proficiencies
  selections.proficiencies.skills = proficientSkills;

  // Equipment (convert to item format)
  selections.equipment.startingEquipment = v1.equipment.map((item, index) => ({
    itemId: normalizeId(item) || `item-${index}`,
    quantity: 1,
    equipped: false,
  }));

  // Spells
  if (v1.spells && v1.spells.length > 0) {
    selections.spells.knownSpells = v1.spells.map(normalizeId);
  }

  // Build derived stats
  const derived = createEmptyDerivedStats();
  derived.abilityModifiers = abilityModifiers;
  derived.proficiencyBonus = proficiencyBonus;
  derived.skills = skillModifiers;
  derived.armorClass = v1.armorClass;
  derived.maxHitPoints = v1.maxHitPoints;
  derived.initiative = abilityModifiers.dexterity;
  derived.passivePerception = 10 + skillModifiers.perception;

  // Estimate hit die from class (basic mapping)
  const hitDieMap: Record<string, number> = {
    barbarian: 12,
    fighter: 10,
    paladin: 10,
    ranger: 10,
    bard: 8,
    cleric: 8,
    druid: 8,
    monk: 8,
    rogue: 8,
    warlock: 8,
    sorcerer: 6,
    wizard: 6,
  };
  derived.hitDice = {
    total: v1.level,
    dieSize: hitDieMap[normalizeId(v1.class)] ?? 8,
    used: 0,
  };

  // Build saving throws (assume class proficiencies based on class)
  derived.savingThrows = {
    strength: abilityModifiers.strength,
    dexterity: abilityModifiers.dexterity,
    constitution: abilityModifiers.constitution,
    intelligence: abilityModifiers.intelligence,
    wisdom: abilityModifiers.wisdom,
    charisma: abilityModifiers.charisma,
  };

  // Return new v2 format
  return {
    id: v1.id,
    schemaVersion: 2,
    appVersion: '0.1.0', // Default for migrated characters
    edition: '5e' as const,
    level: v1.level,
    name: v1.name,
    selections,
    derived,
    currentState: {
      hitPoints: v1.hitPoints,
      tempHitPoints: 0,
      deathSaves: { successes: 0, failures: 0 },
      conditions: [],
      exhaustionLevel: 0,
    },
    enabledModules: [],
    notes: v1.notes,
    createdAt: v1.createdAt,
    updatedAt: new Date().toISOString(), // Update timestamp on migration
  };
}

// Register the migration
registerMigration({
  fromVersion: 1,
  toVersion: 2,
  migrate: migrateV1ToV2,
  description: 'Migrate flat Character to CharacterState with selections and derived stats',
});
