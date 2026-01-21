import type { EditionContent } from './edition';

/**
 * Equipment categories
 */
export type EquipmentCategory =
  | 'weapon'
  | 'armor'
  | 'shield'
  | 'adventuring-gear'
  | 'tool'
  | 'pack';

/**
 * Weapon properties
 */
export type WeaponProperty =
  | 'ammunition'
  | 'finesse'
  | 'heavy'
  | 'light'
  | 'loading'
  | 'range'
  | 'reach'
  | 'special'
  | 'thrown'
  | 'two-handed'
  | 'versatile';

/**
 * Damage types
 */
export type DamageType =
  | 'bludgeoning'
  | 'piercing'
  | 'slashing'
  | 'acid'
  | 'cold'
  | 'fire'
  | 'force'
  | 'lightning'
  | 'necrotic'
  | 'poison'
  | 'psychic'
  | 'radiant'
  | 'thunder';

/**
 * Armor types
 */
export type ArmorType = 'light' | 'medium' | 'heavy' | 'shield';

/**
 * Weapon definition
 */
export interface Weapon extends EditionContent {
  category: 'weapon';
  /** Whether it's a simple or martial weapon */
  weaponCategory: 'simple' | 'martial';
  /** Whether it's melee or ranged */
  weaponType: 'melee' | 'ranged';
  /** Damage dice (e.g., "1d8") */
  damage: string;
  /** Damage type */
  damageType: DamageType;
  /** Weapon properties */
  properties: WeaponProperty[];
  /** Weight in pounds */
  weight: number;
  /** Cost in gold pieces */
  cost: number;
  /** Range for ranged/thrown weapons [normal, long] */
  range?: [number, number];
  /** Versatile damage (if applicable) */
  versatileDamage?: string;
}

/**
 * Armor definition
 */
export interface Armor extends EditionContent {
  category: 'armor' | 'shield';
  /** Armor type */
  armorType: ArmorType;
  /** Base AC */
  baseAC: number;
  /** Max dex bonus (undefined for no limit) */
  maxDexBonus?: number;
  /** Strength requirement */
  strengthRequirement?: number;
  /** Whether it causes stealth disadvantage */
  stealthDisadvantage: boolean;
  /** Weight in pounds */
  weight: number;
  /** Cost in gold pieces */
  cost: number;
}

/**
 * General equipment item
 */
export interface GeneralEquipment extends EditionContent {
  category: 'adventuring-gear' | 'tool' | 'pack';
  /** Weight in pounds */
  weight: number;
  /** Cost in gold pieces */
  cost: number;
  /** For packs: contents */
  contents?: string[];
}

/**
 * Union type for all equipment
 */
export type Equipment = Weapon | Armor | GeneralEquipment;

/**
 * Type guard for weapons
 */
export function isWeapon(equipment: Equipment): equipment is Weapon {
  return equipment.category === 'weapon';
}

/**
 * Type guard for armor
 */
export function isArmor(equipment: Equipment): equipment is Armor {
  return equipment.category === 'armor' || equipment.category === 'shield';
}

/**
 * Type guard for general equipment
 */
export function isGeneralEquipment(equipment: Equipment): equipment is GeneralEquipment {
  return (
    equipment.category === 'adventuring-gear' ||
    equipment.category === 'tool' ||
    equipment.category === 'pack'
  );
}
