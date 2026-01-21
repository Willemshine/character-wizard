import type { AbilityBonuses } from './abilities';
import type { EditionContent } from './edition';

/**
 * Background feature
 */
export interface BackgroundFeature {
  /** Feature name */
  name: string;
  /** Feature description */
  description: string;
}

/**
 * Character background definition
 */
export interface Background extends EditionContent {
  /** Skill proficiencies granted */
  skillProficiencies: string[];
  /** Tool proficiencies granted */
  toolProficiencies: string[];
  /** Languages granted (or number of choices) */
  languages: number;
  /** Starting equipment from background */
  equipment: string[];
  /** Starting gold (in gp) */
  startingGold: number;
  /** Background feature */
  feature: BackgroundFeature;
  /** Ability bonuses (2024 style) */
  abilityBonuses?: AbilityBonuses;
  /** Whether ability bonuses can be reassigned (2024 style) */
  flexibleAbilityBonuses?: boolean;
  /** Suggested characteristics */
  suggestedCharacteristics?: {
    personalityTraits: string[];
    ideals: string[];
    bonds: string[];
    flaws: string[];
  };
}

/**
 * Create a background with default values
 */
export function createBackground(
  partial: Partial<Background> & Pick<Background, 'id' | 'name' | 'editions'>
): Background {
  return {
    skillProficiencies: [],
    toolProficiencies: [],
    languages: 0,
    equipment: [],
    startingGold: 0,
    feature: {
      name: 'Feature',
      description: 'No feature defined.',
    },
    ...partial,
  };
}
