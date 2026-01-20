/**
 * ModulePack - Content module definition for character wizard
 * Allows loading custom content like races, classes, spells, etc.
 */

// =============================================================================
// Module Manifest
// =============================================================================

export interface ModuleManifest {
  /** Unique module identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Module version (semver) */
  version: string;
  /** Module description */
  description: string;
  /** Module author(s) */
  authors: string[];
  /** Supported editions */
  editions: string[];
  /** Minimum app version required */
  minAppVersion: string;
  /** Dependencies on other modules */
  dependencies?: ModuleDependency[];
  /** Module license */
  license?: string;
  /** Homepage or documentation URL */
  url?: string;
}

export interface ModuleDependency {
  moduleId: string;
  minVersion: string;
  maxVersion?: string;
}

// =============================================================================
// Content Types - Base
// =============================================================================

export interface ContentBase {
  id: string;
  name: string;
  description: string;
  source: string;
}

// =============================================================================
// Races / Species
// =============================================================================

export interface AbilityBonus {
  ability: 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma' | 'choice';
  value: number;
}

export interface RaceTrait {
  id: string;
  name: string;
  description: string;
  /** If this trait has options to choose from */
  choices?: TraitChoiceOption[];
}

export interface TraitChoiceOption {
  id: string;
  name: string;
  description: string;
}

export interface SubraceContent extends ContentBase {
  abilityBonuses: AbilityBonus[];
  traits: RaceTrait[];
}

export interface RaceContent extends ContentBase {
  abilityBonuses: AbilityBonus[];
  size: 'tiny' | 'small' | 'medium' | 'large';
  speed: number;
  traits: RaceTrait[];
  languages: string[];
  subraces?: SubraceContent[];
}

// =============================================================================
// Classes
// =============================================================================

export interface HitDice {
  count: number;
  sides: 6 | 8 | 10 | 12;
}

export interface ClassFeature {
  id: string;
  name: string;
  description: string;
  level: number;
  choices?: TraitChoiceOption[];
}

export interface SpellcastingInfo {
  ability: 'intelligence' | 'wisdom' | 'charisma';
  type: 'full' | 'half' | 'third' | 'pact' | 'none';
  spellList: string;
}

export interface SubclassContent extends ContentBase {
  features: ClassFeature[];
  spellcasting?: SpellcastingInfo;
}

export interface ClassContent extends ContentBase {
  hitDice: HitDice;
  primaryAbility: string[];
  savingThrows: string[];
  armorProficiencies: string[];
  weaponProficiencies: string[];
  toolProficiencies: string[];
  skillChoices: {
    count: number;
    from: string[];
  };
  startingEquipment: StartingEquipmentOption[];
  features: ClassFeature[];
  spellcasting?: SpellcastingInfo;
  subclasses?: SubclassContent[];
  subclassLevel: number;
}

export interface StartingEquipmentOption {
  choose: number;
  from: StartingEquipmentChoice[];
}

export interface StartingEquipmentChoice {
  items: { itemId: string; quantity: number }[];
  description: string;
}

// =============================================================================
// Backgrounds
// =============================================================================

export interface BackgroundContent extends ContentBase {
  skillProficiencies: string[];
  toolProficiencies: string[];
  languages: { count: number; from?: string[] };
  equipment: { itemId: string; quantity: number }[];
  feature: {
    name: string;
    description: string;
  };
  suggestedCharacteristics?: {
    personalityTraits: string[];
    ideals: string[];
    bonds: string[];
    flaws: string[];
  };
}

// =============================================================================
// Equipment / Items
// =============================================================================

export type ItemCategory =
  | 'weapon'
  | 'armor'
  | 'shield'
  | 'adventuring-gear'
  | 'tool'
  | 'mount'
  | 'vehicle'
  | 'trade-good'
  | 'treasure';

export interface WeaponProperties {
  type: 'simple' | 'martial';
  range: 'melee' | 'ranged';
  damage: string;
  damageType: string;
  properties: string[];
}

export interface ArmorProperties {
  type: 'light' | 'medium' | 'heavy' | 'shield';
  baseAC: number;
  maxDexBonus?: number;
  strengthRequirement?: number;
  stealthDisadvantage: boolean;
}

export interface ItemContent extends ContentBase {
  category: ItemCategory;
  cost: { amount: number; currency: 'cp' | 'sp' | 'ep' | 'gp' | 'pp' };
  weight: number;
  weapon?: WeaponProperties;
  armor?: ArmorProperties;
}

// =============================================================================
// Spells
// =============================================================================

export interface SpellContent extends ContentBase {
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: {
    verbal: boolean;
    somatic: boolean;
    material: boolean;
    materialDescription?: string;
  };
  duration: string;
  concentration: boolean;
  ritual: boolean;
  classes: string[];
  higherLevels?: string;
}

// =============================================================================
// Feats
// =============================================================================

export interface FeatContent extends ContentBase {
  prerequisite?: string;
  abilityScoreIncrease?: AbilityBonus[];
  benefits: string[];
}

// =============================================================================
// Module Content Arrays
// =============================================================================

export interface ModuleContent {
  races?: RaceContent[];
  classes?: ClassContent[];
  backgrounds?: BackgroundContent[];
  items?: ItemContent[];
  spells?: SpellContent[];
  feats?: FeatContent[];
}

// =============================================================================
// Complete ModulePack
// =============================================================================

export interface ModulePack {
  manifest: ModuleManifest;
  content: ModuleContent;
}

// =============================================================================
// Validation Helpers
// =============================================================================

export function isValidModulePack(data: unknown): data is ModulePack {
  if (!data || typeof data !== 'object') return false;
  const pack = data as Record<string, unknown>;

  if (!pack.manifest || typeof pack.manifest !== 'object') return false;
  const manifest = pack.manifest as Record<string, unknown>;

  return (
    typeof manifest.id === 'string' &&
    typeof manifest.name === 'string' &&
    typeof manifest.version === 'string' &&
    Array.isArray(manifest.editions)
  );
}
