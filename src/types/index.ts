// Core types
export type { Edition, EditionContent } from './edition';
export { EDITIONS, isAvailableForEdition } from './edition';

// Ability types
export type { AbilityName, AbilityScores, AbilityBonuses } from './abilities';
export { ABILITY_NAMES, calculateModifier, DEFAULT_ABILITY_SCORES } from './abilities';

// Race types
export type { Size, RacialTrait, Race } from './race';
export { createRace } from './race';

// Class types
export type {
  HitDie,
  ArmorProficiency,
  WeaponProficiency,
  SpellcastingInfo,
  ClassFeature,
  CharacterClass,
} from './class';
export { createClass } from './class';

// Background types
export type { BackgroundFeature, Background } from './background';
export { createBackground } from './background';

// Spell types
export type {
  SpellSchool,
  SpellLevel,
  CastingTime,
  SpellDuration,
  SpellComponents,
  Spell,
} from './spell';
export { createSpell } from './spell';

// Equipment types
export type {
  EquipmentCategory,
  WeaponProperty,
  DamageType,
  ArmorType,
  Weapon,
  Armor,
  GeneralEquipment,
  Equipment,
} from './equipment';
export { isWeapon, isArmor, isGeneralEquipment } from './equipment';
