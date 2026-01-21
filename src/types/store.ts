import type { Character, CharacterSummary } from './character.ts';
import type { ModuleMetadata, ModulePack } from './module.ts';

export type Route = 'start' | 'wizard' | 'options' | 'character';

export interface WizardState {
  currentStep: number;
  totalSteps: number;
}

export interface AppState {
  currentRoute: Route;
  currentCharacterId: string | null;
  currentCharacter: Character | null;
  characters: CharacterSummary[];
  modules: ModuleMetadata[];
  loadedPacks: ModulePack[];
  wizard: WizardState;
  isLoading: boolean;
  error: string | null;
}

export type StateKey = keyof AppState;

export type Listener<T> = (value: T) => void;

export type Unsubscribe = () => void;
