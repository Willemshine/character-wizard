import type { AbilityName } from './abilities';
import type { EditionContent } from './edition';

/**
 * Hit die sizes used by classes
 */
export type HitDie = 6 | 8 | 10 | 12;

/**
 * Armor proficiency types
 */
export type ArmorProficiency = 'light' | 'medium' | 'heavy' | 'shields';

/**
 * Weapon proficiency categories
 */
export type WeaponProficiency =
  | 'simple'
  | 'martial'
  | 'specific'; // For specific weapon proficiencies

/**
 * Spellcasting ability information
 */
export interface SpellcastingInfo {
  /** The ability used for spellcasting */
  ability: AbilityName;
  /** Whether this is a full caster (spell slots) */
  isFullCaster: boolean;
  /** Cantrips known at level 1 */
  cantripsKnown: number;
  /** Spells known or prepared at level 1 */
  spellsKnown: number;
  /** Spell slots at level 1 */
  spellSlots: number[];
}

/**
 * Class feature gained at a specific level
 */
export interface ClassFeature {
  /** Feature name */
  name: string;
  /** Level when feature is gained */
  level: number;
  /** Feature description */
  description: string;
}

/**
 * Character class definition
 */
export interface CharacterClass extends EditionContent {
  /** Hit die size */
  hitDie: HitDie;
  /** Primary ability for the class */
  primaryAbility: AbilityName;
  /** Saving throw proficiencies */
  savingThrows: AbilityName[];
  /** Armor proficiencies */
  armorProficiencies: ArmorProficiency[];
  /** Weapon proficiencies */
  weaponProficiencies: WeaponProficiency[];
  /** Specific weapons the class is proficient with */
  specificWeapons?: string[];
  /** Number of skills to choose from skill list */
  skillChoices: number;
  /** Available skills to choose from */
  skillOptions: string[];
  /** Starting equipment options (simplified) */
  startingEquipment: string[];
  /** Spellcasting information (undefined for non-casters) */
  spellcasting?: SpellcastingInfo;
  /** Class features by level */
  features: ClassFeature[];
  /** Whether this class is a spellcaster */
  isCaster: boolean;
}

/**
 * Create a class with default values
 */
export function createClass(
  partial: Partial<CharacterClass> &
    Pick<CharacterClass, 'id' | 'name' | 'editions' | 'hitDie' | 'primaryAbility'>
): CharacterClass {
  return {
    savingThrows: [],
    armorProficiencies: [],
    weaponProficiencies: ['simple'],
    skillChoices: 2,
    skillOptions: [],
    startingEquipment: [],
    features: [],
    isCaster: false,
    ...partial,
  };
}
