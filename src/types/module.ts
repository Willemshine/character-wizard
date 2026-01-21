/**
 * Module Pack Types for Character Wizard
 *
 * Module packs contain game content like races, classes, backgrounds, etc.
 * They follow a manifest + content structure for better organization.
 */

import type { AbilityName, Edition } from './character.ts';

// =============================================================================
// Manifest Types
// =============================================================================

export interface ModuleDependency {
  moduleId: string;
  minVersion: string;
}

export interface ModuleManifest {
  id: string;
  name: string;
  version: string;
  schemaVersion: number;
  description: string;
  author?: string;
  license?: string;
  homepage?: string;
  edition?: Edition;
  dependencies?: ModuleDependency[];
  tags?: string[];
}

// =============================================================================
// Proficiency & Choice Types
// =============================================================================

export interface ProficiencyChoice {
  count: number;
  options: string[];
}

export interface GrantedProficiencies {
  skills?: string[];
  skillChoices?: ProficiencyChoice;
  tools?: string[];
  toolChoices?: ProficiencyChoice;
  weapons?: string[];
  armor?: string[];
}

export interface AbilityBonuses {
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
}

export interface AbilityBonusChoice {
  count: number;
  amount: number;
  options?: AbilityName[];
}

export interface FeatureChoice {
  id: string;
  type: 'skill' | 'spell' | 'maneuver' | 'invocation' | 'fighting-style' | 'other';
  count: number;
  options: string[];
  description?: string;
}

// =============================================================================
// Race Types
// =============================================================================

export type CreatureSize = 'Tiny' | 'Small' | 'Medium' | 'Large';

export interface ModuleRace {
  id: string;
  name: string;
  description: string;
  abilityBonuses?: AbilityBonuses;
  abilityBonusChoice?: AbilityBonusChoice;
  size?: CreatureSize;
  speed: number;
  traits: string[];
  languages: string[];
  languageChoice?: number;
  proficiencies?: GrantedProficiencies;
  hasSubraces?: boolean;
}

export interface ModuleSubrace {
  id: string;
  name: string;
  parentRaceId: string;
  description?: string;
  abilityBonuses?: AbilityBonuses;
  traits?: string[];
  proficiencies?: GrantedProficiencies;
}

// =============================================================================
// Class Types
// =============================================================================

export type SpellcastingType = 'full' | 'half' | 'third' | 'pact' | 'none';

export interface SpellcastingConfig {
  ability: 'intelligence' | 'wisdom' | 'charisma';
  type: SpellcastingType;
  known?: boolean;
  ritual?: boolean;
  cantripsKnown?: number[];
  spellsKnown?: number[];
}

export interface ModuleClassFeature {
  id: string;
  name: string;
  level: number;
  description: string;
  choices?: FeatureChoice[];
  grantedProficiencies?: GrantedProficiencies;
}

export interface EquipmentOption {
  type: 'item' | 'choice';
  itemId?: string;
  quantity?: number;
  options?: EquipmentOption[];
}

export interface ModuleClass {
  id: string;
  name: string;
  description: string;
  hitDie: 6 | 8 | 10 | 12;
  primaryAbility: AbilityName[];
  savingThrows: AbilityName[];
  proficiencies?: GrantedProficiencies;
  skillChoices: ProficiencyChoice;
  startingEquipment?: EquipmentOption[];
  features: ModuleClassFeature[];
  spellcasting?: SpellcastingConfig;
  subclassLevel?: number;
  subclassTitle?: string;
}

export interface ModuleSubclass {
  id: string;
  name: string;
  parentClassId: string;
  description?: string;
  features: ModuleClassFeature[];
  spellcasting?: SpellcastingConfig;
  spellList?: string[];
}

// =============================================================================
// Background Types
// =============================================================================

export interface SuggestedCharacteristics {
  personalityTraits?: string[];
  ideals?: string[];
  bonds?: string[];
  flaws?: string[];
}

export interface ModuleBackground {
  id: string;
  name: string;
  description: string;
  skillProficiencies: string[];
  toolProficiencies?: string[];
  languages?: number;
  equipment: string[];
  feature: {
    name: string;
    description: string;
  };
  suggestedCharacteristics?: SuggestedCharacteristics;
}

// =============================================================================
// Feat Types
// =============================================================================

export interface FeatPrerequisites {
  level?: number;
  ability?: Partial<Record<AbilityName, number>>;
  proficiency?: string;
  spellcasting?: boolean;
}

export interface ModuleFeat {
  id: string;
  name: string;
  description: string;
  prerequisites?: FeatPrerequisites;
  abilityIncrease?: AbilityBonusChoice;
  grantedProficiencies?: GrantedProficiencies;
}

// =============================================================================
// Spell Types
// =============================================================================

export type SpellSchool =
  | 'abjuration'
  | 'conjuration'
  | 'divination'
  | 'enchantment'
  | 'evocation'
  | 'illusion'
  | 'necromancy'
  | 'transmutation';

export interface SpellComponents {
  verbal?: boolean;
  somatic?: boolean;
  material?: string;
}

export interface ModuleSpell {
  id: string;
  name: string;
  level: number;
  school: SpellSchool;
  castingTime: string;
  range: string;
  components: SpellComponents;
  duration: string;
  concentration?: boolean;
  ritual?: boolean;
  description: string;
  higherLevels?: string;
  classes: string[];
}

// =============================================================================
// Equipment Types
// =============================================================================

export type EquipmentType = 'weapon' | 'armor' | 'shield' | 'gear' | 'tool' | 'vehicle' | 'mount';
export type CurrencyUnit = 'cp' | 'sp' | 'ep' | 'gp' | 'pp';
export type DamageType = 'bludgeoning' | 'piercing' | 'slashing';
export type ArmorType = 'light' | 'medium' | 'heavy' | 'shield';

export interface ItemCost {
  amount: number;
  unit: CurrencyUnit;
}

export interface WeaponProperties {
  damage: string;
  damageType: DamageType;
  range?: {
    normal: number;
    long: number;
  };
  versatileDamage?: string;
}

export interface ArmorProperties {
  baseAC: number;
  armorType: ArmorType;
  maxDexBonus?: number | null;
  stealthDisadvantage?: boolean;
  strengthRequired?: number;
}

export interface ModuleEquipment {
  id: string;
  name: string;
  type: EquipmentType;
  cost: ItemCost;
  weight: number;
  description?: string;
  properties?: string[];
  weapon?: WeaponProperties;
  armor?: ArmorProperties;
}

// =============================================================================
// Trait Types
// =============================================================================

export interface ModuleTrait {
  id: string;
  name: string;
  description: string;
  choices?: FeatureChoice[];
}

// =============================================================================
// Content Container
// =============================================================================

export interface ModuleContent {
  races?: ModuleRace[];
  subraces?: ModuleSubrace[];
  classes?: ModuleClass[];
  subclasses?: ModuleSubclass[];
  backgrounds?: ModuleBackground[];
  feats?: ModuleFeat[];
  spells?: ModuleSpell[];
  equipment?: ModuleEquipment[];
  traits?: ModuleTrait[];
}

// =============================================================================
// Module Pack (Main Type)
// =============================================================================

export interface ModulePack {
  manifest: ModuleManifest;
  content: ModuleContent;
}

// =============================================================================
// Legacy Support (Flat Format)
// =============================================================================

/** @deprecated Use ModulePack with manifest/content structure instead */
export interface LegacyModulePack {
  id: string;
  name: string;
  version: string;
  description: string;
  author?: string;
  races?: ModuleRace[];
  classes?: ModuleClass[];
  backgrounds?: ModuleBackground[];
  spells?: ModuleSpell[];
  equipment?: ModuleEquipment[];
}

// =============================================================================
// Module Metadata (for UI)
// =============================================================================

export interface ModuleMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  enabled: boolean;
  isBuiltIn: boolean;
  isUploaded: boolean;
}

// =============================================================================
// Factory Functions
// =============================================================================

export function createEmptyModulePack(id: string, name: string): ModulePack {
  return {
    manifest: {
      id,
      name,
      version: '1.0.0',
      schemaVersion: 1,
      description: '',
    },
    content: {},
  };
}

/**
 * Convert legacy flat module pack to new format
 */
export function convertLegacyPack(legacy: LegacyModulePack): ModulePack {
  return {
    manifest: {
      id: legacy.id,
      name: legacy.name,
      version: legacy.version,
      schemaVersion: 1,
      description: legacy.description,
      author: legacy.author,
    },
    content: {
      races: legacy.races,
      classes: legacy.classes,
      backgrounds: legacy.backgrounds,
      spells: legacy.spells,
      equipment: legacy.equipment,
    },
  };
}

/**
 * Check if a pack is in legacy format
 */
export function isLegacyPack(pack: unknown): pack is LegacyModulePack {
  if (typeof pack !== 'object' || pack === null) return false;
  const obj = pack as Record<string, unknown>;
  return !('manifest' in obj) && 'id' in obj && 'name' in obj && 'version' in obj;
}

/**
 * Normalize a pack to the current format
 */
export function normalizePack(pack: unknown): ModulePack {
  if (isLegacyPack(pack)) {
    return convertLegacyPack(pack);
  }
  return pack as ModulePack;
}
