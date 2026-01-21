import type { Background } from '../types';

/**
 * Core pack backgrounds
 * Includes 2 backgrounds for both 2014 and 2024 editions
 */
export const backgrounds: Background[] = [
  // Acolyte - 2014 Edition
  {
    id: 'acolyte-2014',
    name: 'Acolyte',
    editions: ['2014'],
    description:
      'You have spent your life in the service of a temple to a specific god or pantheon of gods.',
    skillProficiencies: ['Insight', 'Religion'],
    toolProficiencies: [],
    languages: 2,
    equipment: [
      'A holy symbol',
      'A prayer book or prayer wheel',
      '5 sticks of incense',
      'Vestments',
      'A set of common clothes',
      '15 gp',
    ],
    startingGold: 15,
    feature: {
      name: 'Shelter of the Faithful',
      description:
        'As an acolyte, you command the respect of those who share your faith. You and your adventuring companions can expect to receive free healing and care at a temple, shrine, or other established presence of your faith.',
    },
    suggestedCharacteristics: {
      personalityTraits: [
        'I idolize a particular hero of my faith, and constantly refer to that person\'s deeds and example.',
        'I can find common ground between the fiercest enemies, empathizing with them and always working toward peace.',
      ],
      ideals: [
        'Tradition. The ancient traditions of worship and sacrifice must be preserved and upheld.',
        'Charity. I always try to help those in need, no matter what the personal cost.',
      ],
      bonds: [
        'I would die to recover an ancient relic of my faith that was lost long ago.',
        'I will someday get revenge on the corrupt temple hierarchy who branded me a heretic.',
      ],
      flaws: [
        'I judge others harshly, and myself even more severely.',
        'I put too much trust in those who wield power within my temple\'s hierarchy.',
      ],
    },
  },

  // Acolyte - 2024 Edition
  {
    id: 'acolyte-2024',
    name: 'Acolyte',
    editions: ['2024'],
    description:
      'You devoted yourself to service in a temple, either nestled in a town or secluded in a sacred grove.',
    skillProficiencies: ['Insight', 'Religion'],
    toolProficiencies: ['Calligrapher\'s Supplies'],
    languages: 1,
    equipment: [
      'A holy symbol',
      'Calligrapher\'s Supplies',
      'Parchment (10 sheets)',
      'A robe',
      '8 gp',
    ],
    startingGold: 8,
    abilityBonuses: {
      intelligence: 1,
      wisdom: 1,
      charisma: 1,
    },
    flexibleAbilityBonuses: true,
    feature: {
      name: 'Shelter of the Faithful',
      description:
        'As an Acolyte, you command the respect of those who share your faith. You and your adventuring companions can expect to receive free healing and care at a temple, shrine, or other established presence of your faith.',
    },
  },

  // Soldier - 2014 Edition
  {
    id: 'soldier-2014',
    name: 'Soldier',
    editions: ['2014'],
    description:
      'War has been your life for as long as you care to remember. You trained as a youth, studied the use of weapons and armor, learned basic survival techniques.',
    skillProficiencies: ['Athletics', 'Intimidation'],
    toolProficiencies: ['One type of gaming set', 'Vehicles (land)'],
    languages: 0,
    equipment: [
      'An insignia of rank',
      'A trophy taken from a fallen enemy',
      'A set of bone dice or a deck of cards',
      'A set of common clothes',
      '10 gp',
    ],
    startingGold: 10,
    feature: {
      name: 'Military Rank',
      description:
        'You have a military rank from your career as a soldier. Soldiers loyal to your former military organization still recognize your authority and influence.',
    },
    suggestedCharacteristics: {
      personalityTraits: [
        'I\'m always polite and respectful.',
        'I\'ve lost too many friends, and I\'m slow to make new ones.',
      ],
      ideals: [
        'Greater Good. Our lot is to lay down our lives in defense of others.',
        'Nation. My city, nation, or people are all that matter.',
      ],
      bonds: [
        'I would still lay down my life for the people I served with.',
        'Someone saved my life on the battlefield. To this day, I will never leave a friend behind.',
      ],
      flaws: [
        'The monstrous enemy we faced in battle still leaves me quivering with fear.',
        'I have little respect for anyone who is not a proven warrior.',
      ],
    },
  },

  // Soldier - 2024 Edition
  {
    id: 'soldier-2024',
    name: 'Soldier',
    editions: ['2024'],
    description:
      'You began training for war as soon as you reached adulthood and carried that training with you.',
    skillProficiencies: ['Athletics', 'Intimidation'],
    toolProficiencies: ['Gaming Set (one of your choice)'],
    languages: 0,
    equipment: [
      'A gaming set',
      'Healer\'s Kit',
      'Quiver',
      'Arrows (20)',
      'Spear',
      'Traveler\'s Clothes',
      '14 gp',
    ],
    startingGold: 14,
    abilityBonuses: {
      strength: 1,
      dexterity: 1,
      constitution: 1,
    },
    flexibleAbilityBonuses: true,
    feature: {
      name: 'Military Rank',
      description:
        'You have a military rank from your past. Soldiers loyal to your former military organization recognize your authority and influence.',
    },
  },
];

export default backgrounds;
