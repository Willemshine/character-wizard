import { create } from 'zustand'
import type { Character, ModulePack } from '../types/character'

interface CharacterState {
  character: Character | null
  modulePacks: ModulePack[]
  setCharacter: (character: Character | null) => void
  toggleModule: (id: string) => void
}

const mockModulePacks: ModulePack[] = [
  {
    id: 'core-rules',
    name: 'Core Rules',
    description: 'Basic rules and mechanics',
    enabled: true,
  },
  {
    id: 'expanded-races',
    name: 'Expanded Races',
    description: 'Additional playable races',
    enabled: false,
  },
  {
    id: 'advanced-classes',
    name: 'Advanced Classes',
    description: 'More class options and subclasses',
    enabled: false,
  },
  {
    id: 'homebrew-spells',
    name: 'Homebrew Spells',
    description: 'Custom spell additions',
    enabled: false,
  },
]

export const useCharacterStore = create<CharacterState>((set) => ({
  character: null,
  modulePacks: mockModulePacks,
  setCharacter: (character) => set({ character }),
  toggleModule: (id) =>
    set((state) => ({
      modulePacks: state.modulePacks.map((pack) =>
        pack.id === id ? { ...pack, enabled: !pack.enabled } : pack
      ),
    })),
}))
