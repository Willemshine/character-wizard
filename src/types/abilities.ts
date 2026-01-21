/**
 * The six core ability scores in D&D
 */
export type AbilityName =
  | 'strength'
  | 'dexterity'
  | 'constitution'
  | 'intelligence'
  | 'wisdom'
  | 'charisma';

export const ABILITY_NAMES: readonly AbilityName[] = [
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
  'charisma',
] as const;

/**
 * Ability score values for a character
 */
export type AbilityScores = Record<AbilityName, number>;

/**
 * Partial ability score bonuses (e.g., from race or background)
 */
export type AbilityBonuses = Partial<Record<AbilityName, number>>;

/**
 * Calculate ability modifier from score
 * @param score - The ability score (typically 1-30)
 * @returns The modifier value
 */
export function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Default starting ability scores
 */
export const DEFAULT_ABILITY_SCORES: AbilityScores = {
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
};
