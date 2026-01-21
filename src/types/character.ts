export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface Appearance {
  age: string;
  height: string;
  weight: string;
  eyes: string;
  skin: string;
  hair: string;
}

export interface Character {
  // Step 1: Basic Info
  name: string;
  playerName: string;

  // Step 2: Race
  race: string;
  subrace: string;

  // Step 3: Class
  characterClass: string;
  subclass: string;
  level: number;

  // Step 4: Ability Scores
  abilityScores: AbilityScores;

  // Step 5: Background
  background: string;
  personalityTraits: string;
  ideals: string;
  bonds: string;
  flaws: string;

  // Step 6: Skills
  skills: string[];

  // Step 7: Equipment
  equipment: string[];
  gold: number;

  // Step 8: Spells
  cantrips: string[];
  spells: string[];

  // Step 9: Features & Traits
  features: string[];
  traits: string[];

  // Step 10: Appearance
  appearance: Appearance;

  // Step 11: Backstory
  backstory: string;
  allies: string;
  enemies: string;
}

export const defaultCharacter: Character = {
  name: '',
  playerName: '',
  race: '',
  subrace: '',
  characterClass: '',
  subclass: '',
  level: 1,
  abilityScores: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  },
  background: '',
  personalityTraits: '',
  ideals: '',
  bonds: '',
  flaws: '',
  skills: [],
  equipment: [],
  gold: 0,
  cantrips: [],
  spells: [],
  features: [],
  traits: [],
  appearance: {
    age: '',
    height: '',
    weight: '',
    eyes: '',
    skin: '',
    hair: '',
  },
  backstory: '',
  allies: '',
  enemies: '',
};

export const RACES = [
  'Human', 'Elf', 'Dwarf', 'Halfling', 'Dragonborn',
  'Gnome', 'Half-Elf', 'Half-Orc', 'Tiefling'
];

export const SUBRACES: Record<string, string[]> = {
  'Elf': ['High Elf', 'Wood Elf', 'Dark Elf'],
  'Dwarf': ['Hill Dwarf', 'Mountain Dwarf'],
  'Halfling': ['Lightfoot', 'Stout'],
  'Gnome': ['Forest Gnome', 'Rock Gnome'],
};

export const CLASSES = [
  'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter',
  'Monk', 'Paladin', 'Ranger', 'Rogue', 'Sorcerer',
  'Warlock', 'Wizard'
];

export const BACKGROUNDS = [
  'Acolyte', 'Charlatan', 'Criminal', 'Entertainer', 'Folk Hero',
  'Guild Artisan', 'Hermit', 'Noble', 'Outlander', 'Sage',
  'Sailor', 'Soldier', 'Urchin'
];

export const ALL_SKILLS = [
  'Acrobatics', 'Animal Handling', 'Arcana', 'Athletics',
  'Deception', 'History', 'Insight', 'Intimidation',
  'Investigation', 'Medicine', 'Nature', 'Perception',
  'Performance', 'Persuasion', 'Religion', 'Sleight of Hand',
  'Stealth', 'Survival'
];

export const EQUIPMENT_OPTIONS = [
  'Longsword', 'Shortsword', 'Dagger', 'Handaxe', 'Javelin',
  'Light Crossbow', 'Shortbow', 'Longbow', 'Shield',
  'Leather Armor', 'Chain Mail', 'Scale Mail',
  'Backpack', 'Bedroll', 'Torch', 'Rope', 'Rations'
];

export const CANTRIPS = [
  'Fire Bolt', 'Mage Hand', 'Prestidigitation', 'Light',
  'Minor Illusion', 'Sacred Flame', 'Thaumaturgy', 'Vicious Mockery',
  'Eldritch Blast', 'Chill Touch', 'Ray of Frost', 'Shocking Grasp'
];

export const SPELLS = [
  'Magic Missile', 'Shield', 'Burning Hands', 'Charm Person',
  'Cure Wounds', 'Detect Magic', 'Disguise Self', 'Fog Cloud',
  'Healing Word', 'Identify', 'Mage Armor', 'Sleep',
  'Thunderwave', 'Witch Bolt', 'Bless', 'Command'
];
