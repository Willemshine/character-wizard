/**
 * CharacterState - Core state definition for character wizard
 * Schema Version: 1
 */

// =============================================================================
// Version & Metadata
// =============================================================================

export interface VersionInfo {
  schemaVersion: number;
  appVersion: string;
}

// =============================================================================
// Edition & Basic Info
// =============================================================================

export type Edition = '5e' | '5e-2024' | 'pf2e' | 'custom';

export interface CharacterMeta {
  id: string;
  name: string;
  edition: Edition;
  level: number;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// Selections - User Choices
// =============================================================================

export interface RaceSelection {
  raceId: string;
  subraceId?: string;
  /** Custom name override (e.g., "species" in 5e 2024) */
  customName?: string;
}

export interface ClassSelection {
  classId: string;
  subclassId?: string;
  level: number;
}

export interface BackgroundSelection {
  backgroundId: string;
  customizations?: Record<string, string>;
}

export type AbilityScoreMethod =
  | 'standard-array'
  | 'point-buy'
  | 'roll'
  | 'manual';

export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface AbilityScoresSelection {
  method: AbilityScoreMethod;
  baseScores: AbilityScores;
  /** Racial/other bonuses applied */
  bonuses: Partial<AbilityScores>;
}

export type ProficiencyType =
  | 'skill'
  | 'saving-throw'
  | 'weapon'
  | 'armor'
  | 'tool'
  | 'language';

export interface ProficiencySelection {
  type: ProficiencyType;
  id: string;
  source: string;
  /** For expertise, half-proficiency, etc. */
  level?: 'half' | 'proficient' | 'expertise';
}

export interface EquipmentItem {
  itemId: string;
  quantity: number;
  equipped: boolean;
  source: string;
}

export interface EquipmentSelection {
  items: EquipmentItem[];
  /** Starting gold if equipment pack was sold */
  startingGold?: number;
}

export interface TraitChoice {
  traitId: string;
  choiceId: string;
  /** Selected option for traits with choices */
  selectedOptionId?: string;
  source: string;
}

export interface SpellSelection {
  spellId: string;
  prepared: boolean;
  source: string;
  /** For ritual-only, at-will, etc. */
  castingType?: 'normal' | 'ritual-only' | 'at-will' | 'innate';
}

export interface Selections {
  race?: RaceSelection;
  classes: ClassSelection[];
  background?: BackgroundSelection;
  abilityScores?: AbilityScoresSelection;
  proficiencies: ProficiencySelection[];
  equipment: EquipmentSelection;
  traits: TraitChoice[];
  spells: SpellSelection[];
}

// =============================================================================
// Derived - Computed Stats
// =============================================================================

export interface AbilityModifiers {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export type SkillName =
  | 'acrobatics'
  | 'animalHandling'
  | 'arcana'
  | 'athletics'
  | 'deception'
  | 'history'
  | 'insight'
  | 'intimidation'
  | 'investigation'
  | 'medicine'
  | 'nature'
  | 'perception'
  | 'performance'
  | 'persuasion'
  | 'religion'
  | 'sleightOfHand'
  | 'stealth'
  | 'survival';

export type AbilityName = keyof AbilityScores;

export interface SkillValue {
  modifier: number;
  proficient: boolean;
  expertise: boolean;
}

export interface SavingThrowValue {
  modifier: number;
  proficient: boolean;
}

export interface DerivedStats {
  /** Final ability scores (base + bonuses) */
  finalAbilityScores: AbilityScores;
  /** Ability modifiers */
  abilityModifiers: AbilityModifiers;
  /** Proficiency bonus based on total level */
  proficiencyBonus: number;
  /** All skill values */
  skills: Record<SkillName, SkillValue>;
  /** Saving throw modifiers */
  savingThrows: Record<AbilityName, SavingThrowValue>;
  /** Armor Class (placeholder - depends on equipment) */
  armorClass: number | null;
  /** Hit Points (placeholder - depends on class/con/level) */
  hitPoints: {
    maximum: number | null;
    current: number | null;
    temporary: number;
  };
  /** Initiative modifier */
  initiative: number;
  /** Movement speed in feet */
  speed: number | null;
  /** Passive perception */
  passivePerception: number;
}

// =============================================================================
// Enabled Modules
// =============================================================================

export interface EnabledModule {
  moduleId: string;
  version: string;
}

// =============================================================================
// Complete CharacterState
// =============================================================================

export interface CharacterState extends VersionInfo {
  meta: CharacterMeta;
  selections: Selections;
  derived: DerivedStats;
  enabledModules: EnabledModule[];
}

// =============================================================================
// Factory & Defaults
// =============================================================================

export const CURRENT_SCHEMA_VERSION = 1;

export function createDefaultAbilityScores(): AbilityScores {
  return {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  };
}

export function createDefaultDerivedStats(): DerivedStats {
  const defaultScores = createDefaultAbilityScores();
  const defaultModifiers: AbilityModifiers = {
    strength: 0,
    dexterity: 0,
    constitution: 0,
    intelligence: 0,
    wisdom: 0,
    charisma: 0,
  };

  const defaultSkill: SkillValue = { modifier: 0, proficient: false, expertise: false };
  const defaultSave: SavingThrowValue = { modifier: 0, proficient: false };

  return {
    finalAbilityScores: defaultScores,
    abilityModifiers: defaultModifiers,
    proficiencyBonus: 2,
    skills: {
      acrobatics: { ...defaultSkill },
      animalHandling: { ...defaultSkill },
      arcana: { ...defaultSkill },
      athletics: { ...defaultSkill },
      deception: { ...defaultSkill },
      history: { ...defaultSkill },
      insight: { ...defaultSkill },
      intimidation: { ...defaultSkill },
      investigation: { ...defaultSkill },
      medicine: { ...defaultSkill },
      nature: { ...defaultSkill },
      perception: { ...defaultSkill },
      performance: { ...defaultSkill },
      persuasion: { ...defaultSkill },
      religion: { ...defaultSkill },
      sleightOfHand: { ...defaultSkill },
      stealth: { ...defaultSkill },
      survival: { ...defaultSkill },
    },
    savingThrows: {
      strength: { ...defaultSave },
      dexterity: { ...defaultSave },
      constitution: { ...defaultSave },
      intelligence: { ...defaultSave },
      wisdom: { ...defaultSave },
      charisma: { ...defaultSave },
    },
    armorClass: null,
    hitPoints: { maximum: null, current: null, temporary: 0 },
    initiative: 0,
    speed: null,
    passivePerception: 10,
  };
}

export function createEmptyCharacterState(
  id: string,
  name: string,
  edition: Edition,
  appVersion: string
): CharacterState {
  const now = new Date().toISOString();

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    appVersion,
    meta: {
      id,
      name,
      edition,
      level: 1,
      createdAt: now,
      updatedAt: now,
    },
    selections: {
      race: undefined,
      classes: [],
      background: undefined,
      abilityScores: undefined,
      proficiencies: [],
      equipment: { items: [] },
      traits: [],
      spells: [],
    },
    derived: createDefaultDerivedStats(),
    enabledModules: [],
  };
}
