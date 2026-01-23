/**
 * Character State Types for Character Wizard
 * Schema Version: 2
 */

// =============================================================================
// Constants
// =============================================================================

export const CURRENT_SCHEMA_VERSION = 2;
export const ABILITY_NAMES = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const;
export const SKILL_NAMES = [
  'acrobatics', 'animalHandling', 'arcana', 'athletics', 'deception',
  'history', 'insight', 'intimidation', 'investigation', 'medicine',
  'nature', 'perception', 'performance', 'persuasion', 'religion',
  'sleightOfHand', 'stealth', 'survival'
] as const;

export type AbilityName = typeof ABILITY_NAMES[number];
export type SkillName = typeof SKILL_NAMES[number];

// Skill to ability mapping
export const SKILL_ABILITY_MAP: Record<SkillName, AbilityName> = {
  acrobatics: 'dexterity',
  animalHandling: 'wisdom',
  arcana: 'intelligence',
  athletics: 'strength',
  deception: 'charisma',
  history: 'intelligence',
  insight: 'wisdom',
  intimidation: 'charisma',
  investigation: 'intelligence',
  medicine: 'wisdom',
  nature: 'intelligence',
  perception: 'wisdom',
  performance: 'charisma',
  persuasion: 'charisma',
  religion: 'intelligence',
  sleightOfHand: 'dexterity',
  stealth: 'dexterity',
  survival: 'wisdom',
};

// =============================================================================
// Ability Scores
// =============================================================================

export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export type AbilityScoreMethod =
  | 'standard-array'
  | 'point-buy'
  | 'manual'
  | 'roll-4d6-drop-lowest'
  | 'roll-3d6';

export interface AbilityScoreSelection {
  method: AbilityScoreMethod;
  baseScores: AbilityScores;
  racialBonuses: Partial<AbilityScores>;
  miscBonuses: Partial<AbilityScores>;
  /** Seed for reproducible dice rolls (used by roll methods) */
  rollSeed?: number;
}

// =============================================================================
// Selections (User Choices)
// =============================================================================

export interface RaceSelection {
  raceId: string;
  subraceId?: string;
  /** Choices made for racial traits (e.g., extra language) */
  traitChoices: Record<string, string | string[]>;
}

export interface ClassSelection {
  classId: string;
  subclassId?: string;
  /** Level at which subclass was chosen */
  subclassLevel?: number;
}

export interface BackgroundSelection {
  backgroundId: string;
  /** Custom background choices (personality traits, ideals, bonds, flaws) */
  customizations: {
    personalityTraits?: string[];
    ideals?: string[];
    bonds?: string[];
    flaws?: string[];
  };
}

export interface ProficiencySelection {
  skills: SkillName[];
  tools: string[];
  weapons: string[];
  armor: string[];
  languages: string[];
  savingThrows: AbilityName[];
}

export interface EquipmentItem {
  itemId: string;
  quantity: number;
  equipped: boolean;
  notes?: string;
}

export interface EquipmentSelection {
  /** Items chosen from starting equipment options */
  startingEquipment: EquipmentItem[];
  /** Items acquired later or manually added */
  additionalEquipment: EquipmentItem[];
  /** Currency in copper pieces (for easy conversion) */
  currency: {
    cp: number;
    sp: number;
    ep: number;
    gp: number;
    pp: number;
  };
}

export interface TraitChoice {
  featureId: string;
  choiceId: string;
  selectedOptions: string[];
}

export interface SpellSelection {
  /** Cantrips known */
  cantrips: string[];
  /** Spells known or in spellbook */
  knownSpells: string[];
  /** Currently prepared spells */
  preparedSpells: string[];
  /** Spell slots used (index = level - 1) */
  usedSlots: number[];
}

export interface CharacterSelections {
  race: RaceSelection | null;
  class: ClassSelection | null;
  background: BackgroundSelection | null;
  abilityScores: AbilityScoreSelection;
  proficiencies: ProficiencySelection;
  equipment: EquipmentSelection;
  traitChoices: TraitChoice[];
  spells: SpellSelection;
}

// =============================================================================
// Derived Stats (Computed Values)
// =============================================================================

export interface AbilityModifiers {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface SavingThrows {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface SkillModifiers {
  acrobatics: number;
  animalHandling: number;
  arcana: number;
  athletics: number;
  deception: number;
  history: number;
  insight: number;
  intimidation: number;
  investigation: number;
  medicine: number;
  nature: number;
  perception: number;
  performance: number;
  persuasion: number;
  religion: number;
  sleightOfHand: number;
  stealth: number;
  survival: number;
}

export interface SpellSlots {
  /** Spell slots per level (index = level - 1, so [0] = 1st level slots) */
  slots: number[];
  /** Spellcasting ability modifier */
  spellcastingAbility: AbilityName | null;
  /** Spell save DC */
  spellSaveDC: number;
  /** Spell attack bonus */
  spellAttackBonus: number;
}

export interface DerivedStats {
  /** Ability modifiers calculated from final scores */
  abilityModifiers: AbilityModifiers;
  /** Proficiency bonus based on level */
  proficiencyBonus: number;
  /** Skill modifiers (ability mod + proficiency if proficient) */
  skills: SkillModifiers;
  /** Saving throw modifiers */
  savingThrows: SavingThrows;
  /** Armor class (placeholder, needs equipment context) */
  armorClass: number;
  /** Maximum hit points */
  maxHitPoints: number;
  /** Hit dice info */
  hitDice: {
    total: number;
    dieSize: number;
    used: number;
  };
  /** Initiative modifier */
  initiative: number;
  /** Base walking speed */
  speed: number;
  /** Passive perception */
  passivePerception: number;
  /** Spell slot information (if spellcaster) */
  spellSlots: SpellSlots | null;
}

// =============================================================================
// Enabled Modules
// =============================================================================

export interface EnabledModule {
  moduleId: string;
  version: string;
  enabledAt: string;
}

// =============================================================================
// Character State (Main Interface)
// =============================================================================

export type Edition = '5e' | '5e-2024' | 'custom';

export interface CharacterState {
  /** Unique identifier for the character */
  id: string;
  /** Schema version for migrations */
  schemaVersion: number;
  /** App version that created/modified this character */
  appVersion: string;

  /** Game edition (5e, 5e-2024, custom) */
  edition: Edition;
  /** Character level (1-20) */
  level: number;

  /** Character's display name */
  name: string;
  /** Player name (optional) */
  playerName?: string;
  /** Experience points (optional, for XP-based progression) */
  experiencePoints?: number;

  /** All user selections made during character creation */
  selections: CharacterSelections;

  /** Computed/derived statistics */
  derived: DerivedStats;

  /** Current resource tracking */
  currentState: {
    hitPoints: number;
    tempHitPoints: number;
    deathSaves: {
      successes: number;
      failures: number;
    };
    conditions: string[];
    exhaustionLevel: number;
  };

  /** Modules enabled for this character */
  enabledModules: EnabledModule[];

  /** Player notes and custom content */
  notes: string;

  /** Timestamps */
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// Legacy Support (v1 Character format)
// =============================================================================

/** @deprecated Use CharacterState instead */
export interface Character {
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

export interface CharacterSummary {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  updatedAt: string;
}

// =============================================================================
// Factory Functions
// =============================================================================

export function createEmptyAbilityScores(): AbilityScores {
  return {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  };
}

export function createEmptySelections(): CharacterSelections {
  return {
    race: null,
    class: null,
    background: null,
    abilityScores: {
      method: 'standard-array',
      baseScores: createEmptyAbilityScores(),
      racialBonuses: {},
      miscBonuses: {},
    },
    proficiencies: {
      skills: [],
      tools: [],
      weapons: [],
      armor: [],
      languages: [],
      savingThrows: [],
    },
    equipment: {
      startingEquipment: [],
      additionalEquipment: [],
      currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    },
    traitChoices: [],
    spells: {
      cantrips: [],
      knownSpells: [],
      preparedSpells: [],
      usedSlots: [],
    },
  };
}

export function createEmptyDerivedStats(): DerivedStats {
  return {
    abilityModifiers: {
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0,
    },
    proficiencyBonus: 2,
    skills: {
      acrobatics: 0,
      animalHandling: 0,
      arcana: 0,
      athletics: 0,
      deception: 0,
      history: 0,
      insight: 0,
      intimidation: 0,
      investigation: 0,
      medicine: 0,
      nature: 0,
      perception: 0,
      performance: 0,
      persuasion: 0,
      religion: 0,
      sleightOfHand: 0,
      stealth: 0,
      survival: 0,
    },
    savingThrows: {
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0,
    },
    armorClass: 10,
    maxHitPoints: 0,
    hitDice: { total: 1, dieSize: 8, used: 0 },
    initiative: 0,
    speed: 30,
    passivePerception: 10,
    spellSlots: null,
  };
}

export function createEmptyCharacterState(appVersion: string): CharacterState {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    schemaVersion: CURRENT_SCHEMA_VERSION,
    appVersion,
    edition: '5e',
    level: 1,
    name: '',
    selections: createEmptySelections(),
    derived: createEmptyDerivedStats(),
    currentState: {
      hitPoints: 0,
      tempHitPoints: 0,
      deathSaves: { successes: 0, failures: 0 },
      conditions: [],
      exhaustionLevel: 0,
    },
    enabledModules: [],
    notes: '',
    createdAt: now,
    updatedAt: now,
  };
}

/** @deprecated Use createEmptyCharacterState instead */
export function createEmptyCharacter(): Character {
  return {
    id: crypto.randomUUID(),
    name: '',
    race: '',
    class: '',
    level: 1,
    background: '',
    abilityScores: createEmptyAbilityScores(),
    hitPoints: 0,
    maxHitPoints: 0,
    armorClass: 10,
    proficiencyBonus: 2,
    skills: [],
    equipment: [],
    features: [],
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// =============================================================================
// Calculation Helpers
// =============================================================================

export function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function calculateProficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1;
}

export function calculateFinalAbilityScores(selection: AbilityScoreSelection): AbilityScores {
  const result = { ...selection.baseScores };

  for (const ability of ABILITY_NAMES) {
    result[ability] += selection.racialBonuses[ability] ?? 0;
    result[ability] += selection.miscBonuses[ability] ?? 0;
  }

  return result;
}

export function calculateAllModifiers(scores: AbilityScores): AbilityModifiers {
  return {
    strength: calculateModifier(scores.strength),
    dexterity: calculateModifier(scores.dexterity),
    constitution: calculateModifier(scores.constitution),
    intelligence: calculateModifier(scores.intelligence),
    wisdom: calculateModifier(scores.wisdom),
    charisma: calculateModifier(scores.charisma),
  };
}

export function calculateSkillModifier(
  skill: SkillName,
  abilityModifiers: AbilityModifiers,
  proficiencyBonus: number,
  isProficient: boolean,
  hasExpertise: boolean = false
): number {
  const abilityMod = abilityModifiers[SKILL_ABILITY_MAP[skill]];
  if (hasExpertise) {
    return abilityMod + (proficiencyBonus * 2);
  }
  if (isProficient) {
    return abilityMod + proficiencyBonus;
  }
  return abilityMod;
}

/**
 * Recalculates all derived stats based on current selections
 */
export function recalculateDerivedStats(state: CharacterState): DerivedStats {
  const finalScores = calculateFinalAbilityScores(state.selections.abilityScores);
  const abilityModifiers = calculateAllModifiers(finalScores);
  const proficiencyBonus = calculateProficiencyBonus(state.level);

  const proficientSkills = new Set(state.selections.proficiencies.skills);
  const skills: SkillModifiers = {} as SkillModifiers;

  for (const skill of SKILL_NAMES) {
    skills[skill] = calculateSkillModifier(
      skill,
      abilityModifiers,
      proficiencyBonus,
      proficientSkills.has(skill)
    );
  }

  const proficientSaves = new Set(state.selections.proficiencies.savingThrows);
  const savingThrows: SavingThrows = {} as SavingThrows;

  for (const ability of ABILITY_NAMES) {
    savingThrows[ability] = abilityModifiers[ability] +
      (proficientSaves.has(ability) ? proficiencyBonus : 0);
  }

  return {
    abilityModifiers,
    proficiencyBonus,
    skills,
    savingThrows,
    armorClass: 10 + abilityModifiers.dexterity, // Base AC, to be overridden by equipment
    maxHitPoints: state.derived.maxHitPoints, // Preserve, needs class info to calculate
    hitDice: state.derived.hitDice, // Preserve, needs class info
    initiative: abilityModifiers.dexterity,
    speed: state.derived.speed, // Preserve, needs race info
    passivePerception: 10 + skills.perception,
    spellSlots: state.derived.spellSlots, // Preserve, needs class info
  };
}
