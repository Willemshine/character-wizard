import type { Race } from '../types';

/**
 * Core pack races/species
 * Includes 2 races for both 2014 and 2024 editions
 */
export const races: Race[] = [
  // Human - 2014 Edition
  {
    id: 'human-2014',
    name: 'Human',
    editions: ['2014'],
    description:
      'Humans are the most adaptable and ambitious people among the common races.',
    abilityBonuses: {
      strength: 1,
      dexterity: 1,
      constitution: 1,
      intelligence: 1,
      wisdom: 1,
      charisma: 1,
    },
    speed: 30,
    size: 'Medium',
    languages: ['Common', 'One additional language of your choice'],
    darkvision: 0,
    traits: [
      {
        name: 'Ability Score Increase',
        description: 'Your ability scores each increase by 1.',
      },
      {
        name: 'Extra Language',
        description: 'You can speak, read, and write one extra language of your choice.',
      },
    ],
  },

  // Human - 2024 Edition
  {
    id: 'human-2024',
    name: 'Human',
    editions: ['2024'],
    description:
      'Humans are the most adaptable and ambitious people among the common races.',
    abilityBonuses: {},
    flexibleAbilityBonuses: true,
    speed: 30,
    size: 'Medium',
    languages: ['Common', 'One additional language of your choice'],
    darkvision: 0,
    traits: [
      {
        name: 'Resourceful',
        description:
          'You gain Heroic Inspiration whenever you finish a Long Rest.',
      },
      {
        name: 'Skillful',
        description: 'You gain proficiency in one skill of your choice.',
      },
      {
        name: 'Versatile',
        description:
          'You gain an Origin feat of your choice. Skilled is recommended.',
      },
    ],
  },

  // Elf - 2014 Edition
  {
    id: 'elf-2014',
    name: 'Elf',
    editions: ['2014'],
    description:
      'Elves are a magical people of otherworldly grace, living in the world but not entirely part of it.',
    abilityBonuses: {
      dexterity: 2,
    },
    speed: 30,
    size: 'Medium',
    languages: ['Common', 'Elvish'],
    darkvision: 60,
    traits: [
      {
        name: 'Darkvision',
        description:
          'You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light.',
      },
      {
        name: 'Keen Senses',
        description: 'You have proficiency in the Perception skill.',
      },
      {
        name: 'Fey Ancestry',
        description:
          'You have advantage on saving throws against being charmed, and magic can\'t put you to sleep.',
      },
      {
        name: 'Trance',
        description:
          'Elves don\'t need to sleep. Instead, they meditate deeply for 4 hours a day.',
      },
    ],
  },

  // Elf - 2024 Edition
  {
    id: 'elf-2024',
    name: 'Elf',
    editions: ['2024'],
    description:
      'Elves are a magical people of otherworldly grace, living in the world but not entirely part of it.',
    abilityBonuses: {},
    flexibleAbilityBonuses: true,
    speed: 30,
    size: 'Medium',
    languages: ['Common', 'Elvish'],
    darkvision: 60,
    traits: [
      {
        name: 'Darkvision',
        description:
          'You have Darkvision with a range of 60 feet.',
      },
      {
        name: 'Elven Lineage',
        description:
          'You are part of a lineage that grants you supernatural abilities. Choose a lineage: Drow, High Elf, or Wood Elf.',
      },
      {
        name: 'Fey Ancestry',
        description:
          'You have Advantage on saving throws you make to avoid or end the Charmed condition.',
      },
      {
        name: 'Keen Senses',
        description: 'You have proficiency in the Perception skill.',
      },
      {
        name: 'Trance',
        description:
          'You don\'t need to sleep, and magic can\'t put you to sleep. You can finish a Long Rest in 4 hours.',
      },
    ],
  },
];

export default races;
