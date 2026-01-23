/**
 * ChoiceResolver Types
 *
 * Generic types for handling choices from packs with validation and UI generation.
 */

/**
 * Represents a single option that can be chosen
 */
export interface ChoiceOption<T = unknown> {
  /** Unique identifier for this option */
  id: string;
  /** Display name */
  name: string;
  /** Optional description */
  description?: string;
  /** Category for grouping (e.g., 'class', 'background', 'race') */
  category?: string;
  /** Tags for filtering */
  tags?: string[];
  /** Whether this option is disabled */
  disabled?: boolean;
  /** Reason why this option is disabled */
  disabledReason?: string;
  /** Whether this option is pre-granted (locked selection) */
  granted?: boolean;
  /** Source of the grant (e.g., 'Background: Acolyte') */
  grantedSource?: string;
  /** The underlying data object */
  data?: T;
}

/**
 * Configuration for a choice resolver
 */
export interface ChoiceConfig<T = unknown> {
  /** Unique ID for this choice (e.g., 'class-skills', 'racial-languages') */
  id: string;
  /** Title to display */
  title: string;
  /** Description/instructions */
  description?: string;
  /** Selection mode */
  mode: 'single' | 'multi';
  /** Minimum number of selections required (default: 0) */
  minSelections?: number;
  /** Maximum number of selections allowed (default: Infinity for multi, 1 for single) */
  maxSelections?: number;
  /** Available options to choose from */
  options: ChoiceOption<T>[];
  /** Currently selected option IDs */
  selectedIds: string[];
  /** Whether search/filter is enabled */
  searchable?: boolean;
  /** Placeholder text for search input */
  searchPlaceholder?: string;
  /** UI display mode */
  displayMode?: 'list' | 'grid' | 'compact';
  /** Show granted items separately */
  showGranted?: boolean;
  /** Category filter options */
  categoryFilters?: string[];
  /** Whether to allow clearing all selections */
  allowClear?: boolean;
  /** Custom render function for option cards */
  renderOption?: (option: ChoiceOption<T>) => unknown;
}

/**
 * Validation result for a choice resolver
 */
export interface ChoiceValidation {
  /** Whether the current selections are valid */
  isValid: boolean;
  /** Error messages */
  errors: string[];
  /** Warning messages (non-blocking) */
  warnings?: string[];
  /** Number of selections still needed */
  selectionsNeeded: number;
  /** Number of additional selections allowed */
  selectionsRemaining: number;
}

/**
 * Event detail for selection changes
 */
export interface ChoiceSelectionEvent<T = unknown> {
  /** The choice config ID */
  choiceId: string;
  /** All currently selected option IDs */
  selectedIds: string[];
  /** The option that was just added (if applicable) */
  added?: ChoiceOption<T>;
  /** The option that was just removed (if applicable) */
  removed?: ChoiceOption<T>;
  /** Validation result after this change */
  validation: ChoiceValidation;
}

/**
 * Validates a choice configuration and returns the validation result
 */
export function validateChoice<T>(config: ChoiceConfig<T>): ChoiceValidation {
  const { mode, minSelections = 0, maxSelections, selectedIds, options } = config;
  const effectiveMax = maxSelections ?? (mode === 'single' ? 1 : Infinity);

  const totalSelected = selectedIds.length;

  const errors: string[] = [];
  const warnings: string[] = [];

  // Check minimum
  const selectionsNeeded = Math.max(0, minSelections - totalSelected);
  if (selectionsNeeded > 0) {
    errors.push(`Select ${selectionsNeeded} more option${selectionsNeeded > 1 ? 's' : ''}`);
  }

  // Check maximum
  const selectionsRemaining = Math.max(0, effectiveMax - totalSelected);
  if (totalSelected > effectiveMax) {
    errors.push(`Too many selections (max ${effectiveMax})`);
  }

  // Check for invalid selections (options that don't exist)
  const validOptionIds = new Set(options.map(o => o.id));
  const invalidSelections = selectedIds.filter(id => !validOptionIds.has(id));
  if (invalidSelections.length > 0) {
    warnings.push(`Some selected options are no longer available`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
    selectionsNeeded,
    selectionsRemaining,
  };
}

/**
 * Creates a ChoiceOption from various source types
 */
export function createChoiceOption<T>(
  id: string,
  name: string,
  options?: Partial<ChoiceOption<T>>
): ChoiceOption<T> {
  return {
    id,
    name,
    ...options,
  };
}

/**
 * Filters options based on search query and category
 */
export function filterOptions<T>(
  options: ChoiceOption<T>[],
  query: string,
  category?: string
): ChoiceOption<T>[] {
  const normalizedQuery = query.toLowerCase().trim();

  return options.filter(option => {
    // Category filter
    if (category && option.category !== category) {
      return false;
    }

    // Search query filter
    if (normalizedQuery) {
      const searchableText = [
        option.name,
        option.description,
        ...(option.tags ?? []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    }

    return true;
  });
}

/**
 * Groups options by category
 */
export function groupOptionsByCategory<T>(
  options: ChoiceOption<T>[]
): Map<string, ChoiceOption<T>[]> {
  const groups = new Map<string, ChoiceOption<T>[]>();

  for (const option of options) {
    const category = option.category ?? 'Other';
    const existing = groups.get(category) ?? [];
    groups.set(category, [...existing, option]);
  }

  return groups;
}

// =============================================================================
// Specialized Choice Types for D&D 5e
// =============================================================================

/**
 * Proficiency choice configuration
 */
export interface ProficiencyChoiceConfig extends ChoiceConfig<string> {
  /** Type of proficiency */
  proficiencyType: 'skill' | 'tool' | 'weapon' | 'armor' | 'language';
  /** Source of this choice (class, race, background, feat) */
  source: string;
  /** Source ID for tracking */
  sourceId: string;
}

/**
 * Spell choice configuration
 */
export interface SpellChoiceConfig extends ChoiceConfig<SpellOptionData> {
  /** Whether these are cantrips */
  isCantrip: boolean;
  /** Spell level filter (0 for cantrips) */
  spellLevel?: number;
  /** Maximum spell level available */
  maxSpellLevel?: number;
  /** Class spell list restriction */
  classRestriction?: string;
  /** Additional spell list expansions */
  expandedLists?: string[];
}

/**
 * Spell option data
 */
export interface SpellOptionData {
  id: string;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  duration: string;
  concentration?: boolean;
  ritual?: boolean;
  components: {
    verbal?: boolean;
    somatic?: boolean;
    material?: string;
  };
  description: string;
  classes: string[];
}

/**
 * Equipment choice configuration
 */
export interface EquipmentChoiceConfig extends ChoiceConfig<EquipmentOptionData> {
  /** Equipment group ID (for equipment packs) */
  groupId: string;
  /** Whether this is a mutually exclusive choice */
  exclusive?: boolean;
}

/**
 * Equipment option data
 */
export interface EquipmentOptionData {
  id: string;
  name: string;
  type: string;
  cost?: { amount: number; unit: string };
  weight?: number;
  description?: string;
  quantity?: number;
}

/**
 * Trait/Feature choice configuration
 */
export interface TraitChoiceConfig extends ChoiceConfig<TraitOptionData> {
  /** Feature ID this choice belongs to */
  featureId: string;
  /** Type of trait choice */
  traitType: 'invocation' | 'maneuver' | 'fighting-style' | 'metamagic' | 'other';
  /** Level requirement */
  levelRequirement?: number;
}

/**
 * Trait option data
 */
export interface TraitOptionData {
  id: string;
  name: string;
  description: string;
  prerequisites?: string[];
  levelRequirement?: number;
}
