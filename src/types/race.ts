import type { AbilityBonuses } from './abilities';
import type { EditionContent } from './edition';

/**
 * Size categories for races/species
 */
export type Size = 'Small' | 'Medium' | 'Large';

/**
 * A racial trait or feature
 */
export interface RacialTrait {
  /** Trait name */
  name: string;
  /** Trait description */
  description: string;
}

/**
 * Race/Species definition
 * Note: 2024 edition uses "species" terminology, but we use "race" for data consistency
 */
export interface Race extends EditionContent {
  /** Ability score increases (2014 style) or flexible bonuses (2024 style) */
  abilityBonuses: AbilityBonuses;
  /** Whether ability bonuses can be reassigned (2024 style) */
  flexibleAbilityBonuses?: boolean;
  /** Base walking speed in feet */
  speed: number;
  /** Size category */
  size: Size;
  /** Languages known */
  languages: string[];
  /** Racial traits and features */
  traits: RacialTrait[];
  /** Darkvision range in feet (0 if none) */
  darkvision: number;
}

/**
 * Create a race with default values
 */
export function createRace(
  partial: Partial<Race> & Pick<Race, 'id' | 'name' | 'editions'>
): Race {
  return {
    abilityBonuses: {},
    speed: 30,
    size: 'Medium',
    languages: ['Common'],
    traits: [],
    darkvision: 0,
    ...partial,
  };
}
