/**
 * Choice Resolver Components
 *
 * Generic and specialized components for handling character creation choices
 * from packs with validation and flexible UI.
 */

// Types
export type {
  ChoiceOption,
  ChoiceConfig,
  ChoiceValidation,
  ChoiceSelectionEvent,
  ProficiencyChoiceConfig,
  SpellChoiceConfig,
  SpellOptionData,
  EquipmentChoiceConfig,
  EquipmentOptionData,
  TraitChoiceConfig,
  TraitOptionData,
} from './choice-resolver-types.ts';

// Utility functions
export {
  validateChoice,
  createChoiceOption,
  filterOptions,
  groupOptionsByCategory,
} from './choice-resolver-types.ts';

// Base component
export { ChoiceResolver } from './choice-resolver.ts';

// Specialized components
export { SpellChoiceResolver } from './spell-choice-resolver.ts';
export { ProficiencyChoiceResolver } from './proficiency-choice-resolver.ts';
export type { ProficiencyType, ProficiencySource } from './proficiency-choice-resolver.ts';
export { EquipmentChoiceResolver } from './equipment-choice-resolver.ts';
export type { EquipmentChoiceGroup, EquipmentGroupOption, EquipmentItem } from './equipment-choice-resolver.ts';
export { TraitChoiceResolver } from './trait-choice-resolver.ts';
export type { TraitSource, TraitChoiceWithSource } from './trait-choice-resolver.ts';
