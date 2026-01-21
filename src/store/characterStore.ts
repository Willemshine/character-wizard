import { create } from 'zustand';
import type { Character, AbilityScores, Appearance } from '../types/character';
import { defaultCharacter } from '../types/character';

interface CharacterStore {
  character: Character;
  currentStep: number;

  // Navigation
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Step 1: Basic Info
  setBasicInfo: (name: string, playerName: string) => void;

  // Step 2: Race
  setRace: (race: string, subrace: string) => void;

  // Step 3: Class
  setClass: (characterClass: string, subclass: string, level: number) => void;

  // Step 4: Ability Scores
  setAbilityScores: (scores: AbilityScores) => void;

  // Step 5: Background
  setBackground: (data: {
    background: string;
    personalityTraits: string;
    ideals: string;
    bonds: string;
    flaws: string;
  }) => void;

  // Step 6: Skills
  setSkills: (skills: string[]) => void;

  // Step 7: Equipment
  setEquipment: (equipment: string[], gold: number) => void;

  // Step 8: Spells
  setSpells: (cantrips: string[], spells: string[]) => void;

  // Step 9: Features & Traits
  setFeaturesAndTraits: (features: string[], traits: string[]) => void;

  // Step 10: Appearance
  setAppearance: (appearance: Appearance) => void;

  // Step 11: Backstory
  setBackstory: (backstory: string, allies: string, enemies: string) => void;

  // Reset
  resetCharacter: () => void;
}

export const useCharacterStore = create<CharacterStore>((set) => ({
  character: defaultCharacter,
  currentStep: 0,

  setCurrentStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  prevStep: () => set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),

  setBasicInfo: (name, playerName) =>
    set((state) => ({
      character: { ...state.character, name, playerName },
    })),

  setRace: (race, subrace) =>
    set((state) => ({
      character: { ...state.character, race, subrace },
    })),

  setClass: (characterClass, subclass, level) =>
    set((state) => ({
      character: { ...state.character, characterClass, subclass, level },
    })),

  setAbilityScores: (abilityScores) =>
    set((state) => ({
      character: { ...state.character, abilityScores },
    })),

  setBackground: (data) =>
    set((state) => ({
      character: { ...state.character, ...data },
    })),

  setSkills: (skills) =>
    set((state) => ({
      character: { ...state.character, skills },
    })),

  setEquipment: (equipment, gold) =>
    set((state) => ({
      character: { ...state.character, equipment, gold },
    })),

  setSpells: (cantrips, spells) =>
    set((state) => ({
      character: { ...state.character, cantrips, spells },
    })),

  setFeaturesAndTraits: (features, traits) =>
    set((state) => ({
      character: { ...state.character, features, traits },
    })),

  setAppearance: (appearance) =>
    set((state) => ({
      character: { ...state.character, appearance },
    })),

  setBackstory: (backstory, allies, enemies) =>
    set((state) => ({
      character: { ...state.character, backstory, allies, enemies },
    })),

  resetCharacter: () =>
    set({ character: defaultCharacter, currentStep: 0 }),
}));
