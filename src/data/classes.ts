import type { CharacterClass } from '../types';

/**
 * Core pack classes
 * Includes 1 caster (Wizard) and 1 non-caster (Fighter) for both editions
 */
export const classes: CharacterClass[] = [
  // Fighter - 2014 Edition
  {
    id: 'fighter-2014',
    name: 'Fighter',
    editions: ['2014'],
    description:
      'A master of martial combat, skilled with a variety of weapons and armor.',
    hitDie: 10,
    primaryAbility: 'strength',
    savingThrows: ['strength', 'constitution'],
    armorProficiencies: ['light', 'medium', 'heavy', 'shields'],
    weaponProficiencies: ['simple', 'martial'],
    skillChoices: 2,
    skillOptions: [
      'Acrobatics',
      'Animal Handling',
      'Athletics',
      'History',
      'Insight',
      'Intimidation',
      'Perception',
      'Survival',
    ],
    startingEquipment: [
      'Chain mail or leather armor and longbow with 20 arrows',
      'A martial weapon and a shield or two martial weapons',
      'A light crossbow and 20 bolts or two handaxes',
      "A dungeoneer's pack or an explorer's pack",
    ],
    isCaster: false,
    features: [
      {
        name: 'Fighting Style',
        level: 1,
        description:
          'You adopt a particular style of fighting as your specialty.',
      },
      {
        name: 'Second Wind',
        level: 1,
        description:
          'You have a limited well of stamina that you can draw on to protect yourself from harm. On your turn, you can use a bonus action to regain hit points equal to 1d10 + your fighter level.',
      },
      {
        name: 'Action Surge',
        level: 2,
        description:
          'You can push yourself beyond your normal limits for a moment. On your turn, you can take one additional action.',
      },
    ],
  },

  // Fighter - 2024 Edition
  {
    id: 'fighter-2024',
    name: 'Fighter',
    editions: ['2024'],
    description:
      'A master of martial combat, skilled with a variety of weapons and armor.',
    hitDie: 10,
    primaryAbility: 'strength',
    savingThrows: ['strength', 'constitution'],
    armorProficiencies: ['light', 'medium', 'heavy', 'shields'],
    weaponProficiencies: ['simple', 'martial'],
    skillChoices: 2,
    skillOptions: [
      'Acrobatics',
      'Animal Handling',
      'Athletics',
      'History',
      'Insight',
      'Intimidation',
      'Perception',
      'Survival',
    ],
    startingEquipment: [
      'Chain Mail, Greatsword, Flail, 8 Javelins, Dungeoneer\'s Pack, and 4 GP',
      'Or 150 GP to buy your own equipment',
    ],
    isCaster: false,
    features: [
      {
        name: 'Fighting Style',
        level: 1,
        description:
          'You gain a Fighting Style feat of your choice. Defense is recommended.',
      },
      {
        name: 'Second Wind',
        level: 1,
        description:
          'You have a limited well of stamina. As a Bonus Action, you can regain hit points equal to 1d10 plus your Fighter level. You can use this feature twice, regaining all uses on a Short or Long Rest.',
      },
      {
        name: 'Weapon Mastery',
        level: 1,
        description:
          'You can use the mastery property of three kinds of Simple or Martial weapons.',
      },
      {
        name: 'Action Surge',
        level: 2,
        description:
          'You can push yourself beyond your normal limits. On your turn, you can take one additional action. Once you use this feature, you must finish a Short or Long Rest before using it again.',
      },
      {
        name: 'Tactical Mind',
        level: 2,
        description:
          'When you fail an ability check, you can expend a use of Second Wind to add 1d10 to the roll.',
      },
    ],
  },

  // Wizard - 2014 Edition
  {
    id: 'wizard-2014',
    name: 'Wizard',
    editions: ['2014'],
    description:
      'A scholarly magic-user capable of manipulating the structures of reality.',
    hitDie: 6,
    primaryAbility: 'intelligence',
    savingThrows: ['intelligence', 'wisdom'],
    armorProficiencies: [],
    weaponProficiencies: ['specific'],
    specificWeapons: ['daggers', 'darts', 'slings', 'quarterstaffs', 'light crossbows'],
    skillChoices: 2,
    skillOptions: [
      'Arcana',
      'History',
      'Insight',
      'Investigation',
      'Medicine',
      'Religion',
    ],
    startingEquipment: [
      'A quarterstaff or a dagger',
      "A component pouch or an arcane focus",
      "A scholar's pack or an explorer's pack",
      'A spellbook',
    ],
    isCaster: true,
    spellcasting: {
      ability: 'intelligence',
      isFullCaster: true,
      cantripsKnown: 3,
      spellsKnown: 6,
      spellSlots: [2],
    },
    features: [
      {
        name: 'Spellcasting',
        level: 1,
        description:
          'As a student of arcane magic, you have a spellbook containing spells that show the first glimmerings of your true power.',
      },
      {
        name: 'Arcane Recovery',
        level: 1,
        description:
          'Once per day when you finish a short rest, you can recover expended spell slots with a combined level equal to or less than half your wizard level (rounded up).',
      },
      {
        name: 'Arcane Tradition',
        level: 2,
        description:
          'You choose an arcane tradition, shaping your practice of magic.',
      },
    ],
  },

  // Wizard - 2024 Edition
  {
    id: 'wizard-2024',
    name: 'Wizard',
    editions: ['2024'],
    description:
      'A scholarly magic-user capable of manipulating the structures of reality.',
    hitDie: 6,
    primaryAbility: 'intelligence',
    savingThrows: ['intelligence', 'wisdom'],
    armorProficiencies: [],
    weaponProficiencies: ['simple'],
    skillChoices: 2,
    skillOptions: [
      'Arcana',
      'History',
      'Insight',
      'Investigation',
      'Medicine',
      'Nature',
      'Religion',
    ],
    startingEquipment: [
      'Quarterstaff, Spellbook, Arcane Focus (crystal), Robe, Scholar\'s Pack, and 5 GP',
      'Or 55 GP to buy your own equipment',
    ],
    isCaster: true,
    spellcasting: {
      ability: 'intelligence',
      isFullCaster: true,
      cantripsKnown: 3,
      spellsKnown: 6,
      spellSlots: [2],
    },
    features: [
      {
        name: 'Spellcasting',
        level: 1,
        description:
          'As a student of arcane magic, you have learned to cast spells. You have a spellbook containing the written manifestation of your spells.',
      },
      {
        name: 'Ritual Adept',
        level: 1,
        description:
          'You can cast any spell as a Ritual if that spell has the Ritual tag and the spell is in your spellbook.',
      },
      {
        name: 'Arcane Recovery',
        level: 1,
        description:
          'Once per day when you finish a Short Rest, you can recover expended spell slots with a combined level equal to no more than half your Wizard level (rounded up).',
      },
      {
        name: 'Scholar',
        level: 2,
        description:
          'While studying your spellbook, you can make any spell you are preparing substitutable.',
      },
    ],
  },
];

export default classes;
