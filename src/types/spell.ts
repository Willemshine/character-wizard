import type { EditionContent } from './edition';

/**
 * Spell schools of magic
 */
export type SpellSchool =
  | 'Abjuration'
  | 'Conjuration'
  | 'Divination'
  | 'Enchantment'
  | 'Evocation'
  | 'Illusion'
  | 'Necromancy'
  | 'Transmutation';

/**
 * Spell level (0 = cantrip, 1-9 = spell levels)
 */
export type SpellLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/**
 * Spell casting time
 */
export interface CastingTime {
  /** Amount of time */
  amount: number;
  /** Unit of time */
  unit: 'action' | 'bonus action' | 'reaction' | 'minute' | 'hour';
  /** Reaction trigger (if applicable) */
  reactionTrigger?: string;
}

/**
 * Spell duration
 */
export interface SpellDuration {
  /** Type of duration */
  type: 'instantaneous' | 'concentration' | 'timed';
  /** Amount of time (if timed) */
  amount?: number;
  /** Unit of time (if timed) */
  unit?: 'round' | 'minute' | 'hour' | 'day';
}

/**
 * Spell components
 */
export interface SpellComponents {
  /** Verbal component */
  verbal: boolean;
  /** Somatic component */
  somatic: boolean;
  /** Material component */
  material: boolean;
  /** Material component description */
  materialDescription?: string;
  /** Material cost in gold (0 if free) */
  materialCost?: number;
  /** Whether material is consumed */
  materialConsumed?: boolean;
}

/**
 * Spell definition
 */
export interface Spell extends EditionContent {
  /** Spell level (0 for cantrips) */
  level: SpellLevel;
  /** School of magic */
  school: SpellSchool;
  /** Casting time */
  castingTime: CastingTime;
  /** Range in feet (0 for self, -1 for touch) */
  range: number | 'self' | 'touch';
  /** Components required */
  components: SpellComponents;
  /** Duration */
  duration: SpellDuration;
  /** Classes that can learn this spell */
  classes: string[];
  /** Whether this is a ritual spell */
  ritual: boolean;
  /** Spell effect description */
  effect: string;
  /** Higher level casting effects */
  higherLevels?: string;
}

/**
 * Create a spell with default values
 */
export function createSpell(
  partial: Partial<Spell> &
    Pick<Spell, 'id' | 'name' | 'editions' | 'level' | 'school' | 'effect'>
): Spell {
  return {
    castingTime: { amount: 1, unit: 'action' },
    range: 'self',
    components: { verbal: true, somatic: false, material: false },
    duration: { type: 'instantaneous' },
    classes: [],
    ritual: false,
    ...partial,
  };
}
