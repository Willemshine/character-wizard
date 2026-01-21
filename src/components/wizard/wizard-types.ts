/**
 * Wizard Step Types and Interfaces
 */

import type { CharacterState, CharacterSelections } from '../../types/character.ts';

export interface WizardStepConfig {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  required: boolean;
  /** Condition to determine if step should be shown */
  isVisible?: (formState: WizardFormState) => boolean;
}

export interface WizardFormState {
  /** Current character state being built */
  character: CharacterState;
  /** Validation errors per step */
  stepErrors: Record<string, string[]>;
  /** Whether each step has been visited */
  visitedSteps: Set<number>;
  /** Whether each step is complete (all required fields filled) */
  completedSteps: Set<number>;
}

export interface StepComponentProps {
  formState: WizardFormState;
  onUpdate: (updates: Partial<CharacterSelections>) => void;
  onCharacterUpdate: (updates: Partial<CharacterState>) => void;
}

export interface StepValidationResult {
  isValid: boolean;
  errors: string[];
}

/** Standard wizard steps configuration */
export const WIZARD_STEPS: WizardStepConfig[] = [
  {
    id: 'basic-info',
    title: 'Basic Information',
    shortTitle: 'Basics',
    description: 'Enter your character name and basic details',
    required: true,
  },
  {
    id: 'race',
    title: 'Choose Race',
    shortTitle: 'Race',
    description: 'Select your character\'s race',
    required: true,
  },
  {
    id: 'subrace',
    title: 'Choose Subrace',
    shortTitle: 'Subrace',
    description: 'Select your character\'s subrace',
    required: false,
    isVisible: (formState) => {
      // Only show if the selected race has subraces
      return formState.character.selections.race !== null;
    },
  },
  {
    id: 'class',
    title: 'Choose Class',
    shortTitle: 'Class',
    description: 'Select your character\'s class',
    required: true,
  },
  {
    id: 'subclass',
    title: 'Choose Subclass',
    shortTitle: 'Subclass',
    description: 'Select your character\'s subclass',
    required: false,
    isVisible: (formState) => {
      // Only show if the selected class has subclasses and level is high enough
      return formState.character.selections.class !== null;
    },
  },
  {
    id: 'background',
    title: 'Choose Background',
    shortTitle: 'Background',
    description: 'Select your character\'s background',
    required: true,
  },
  {
    id: 'ability-scores',
    title: 'Ability Scores',
    shortTitle: 'Abilities',
    description: 'Assign your ability scores',
    required: true,
  },
  {
    id: 'skills',
    title: 'Skills & Proficiencies',
    shortTitle: 'Skills',
    description: 'Choose your skill proficiencies',
    required: true,
  },
  {
    id: 'equipment',
    title: 'Equipment',
    shortTitle: 'Equipment',
    description: 'Select your starting equipment',
    required: true,
  },
  {
    id: 'spells',
    title: 'Spells',
    shortTitle: 'Spells',
    description: 'Choose your spells',
    required: false,
    isVisible: (formState) => {
      // Only show if the class has spellcasting
      return formState.character.selections.class !== null;
    },
  },
  {
    id: 'features',
    title: 'Features & Traits',
    shortTitle: 'Features',
    description: 'Make choices for your features',
    required: false,
  },
  {
    id: 'review',
    title: 'Review Character',
    shortTitle: 'Review',
    description: 'Review and finalize your character',
    required: true,
  },
];

export function createInitialFormState(character: CharacterState): WizardFormState {
  return {
    character,
    stepErrors: {},
    visitedSteps: new Set([0]),
    completedSteps: new Set(),
  };
}
