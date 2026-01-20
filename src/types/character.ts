export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface Character {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  background: string;
  abilityScores: AbilityScores;
  hitPoints: number;
  maxHitPoints: number;
  armorClass: number;
  proficiencyBonus: number;
  skills: string[];
  equipment: string[];
  features: string[];
  spells?: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterSummary {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  updatedAt: string;
}

export function createEmptyCharacter(): Character {
  return {
    id: crypto.randomUUID(),
    name: '',
    race: '',
    class: '',
    level: 1,
    background: '',
    abilityScores: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    hitPoints: 0,
    maxHitPoints: 0,
    armorClass: 10,
    proficiencyBonus: 2,
    skills: [],
    equipment: [],
    features: [],
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}
