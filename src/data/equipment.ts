import type { Weapon, Armor, GeneralEquipment, Equipment } from '../types';

/**
 * Core pack weapons
 */
export const weapons: Weapon[] = [
  // Simple Melee Weapons
  {
    id: 'dagger',
    name: 'Dagger',
    editions: ['2014', '2024'],
    description: 'A simple blade useful for close combat or throwing.',
    category: 'weapon',
    weaponCategory: 'simple',
    weaponType: 'melee',
    damage: '1d4',
    damageType: 'piercing',
    properties: ['finesse', 'light', 'thrown'],
    range: [20, 60],
    weight: 1,
    cost: 2,
  },
  {
    id: 'quarterstaff',
    name: 'Quarterstaff',
    editions: ['2014', '2024'],
    description: 'A simple wooden staff used as a weapon or walking stick.',
    category: 'weapon',
    weaponCategory: 'simple',
    weaponType: 'melee',
    damage: '1d6',
    damageType: 'bludgeoning',
    properties: ['versatile'],
    versatileDamage: '1d8',
    weight: 4,
    cost: 0.2,
  },

  // Simple Ranged Weapons
  {
    id: 'light-crossbow',
    name: 'Light Crossbow',
    editions: ['2014', '2024'],
    description: 'A mechanical ranged weapon that fires bolts.',
    category: 'weapon',
    weaponCategory: 'simple',
    weaponType: 'ranged',
    damage: '1d8',
    damageType: 'piercing',
    properties: ['ammunition', 'loading', 'two-handed'],
    range: [80, 320],
    weight: 5,
    cost: 25,
  },

  // Martial Melee Weapons
  {
    id: 'longsword',
    name: 'Longsword',
    editions: ['2014', '2024'],
    description: 'A versatile blade favored by warriors.',
    category: 'weapon',
    weaponCategory: 'martial',
    weaponType: 'melee',
    damage: '1d8',
    damageType: 'slashing',
    properties: ['versatile'],
    versatileDamage: '1d10',
    weight: 3,
    cost: 15,
  },
  {
    id: 'greatsword',
    name: 'Greatsword',
    editions: ['2014', '2024'],
    description: 'A large two-handed blade dealing heavy damage.',
    category: 'weapon',
    weaponCategory: 'martial',
    weaponType: 'melee',
    damage: '2d6',
    damageType: 'slashing',
    properties: ['heavy', 'two-handed'],
    weight: 6,
    cost: 50,
  },
  {
    id: 'handaxe',
    name: 'Handaxe',
    editions: ['2014', '2024'],
    description: 'A small axe suitable for melee or throwing.',
    category: 'weapon',
    weaponCategory: 'simple',
    weaponType: 'melee',
    damage: '1d6',
    damageType: 'slashing',
    properties: ['light', 'thrown'],
    range: [20, 60],
    weight: 2,
    cost: 5,
  },

  // Martial Ranged Weapons
  {
    id: 'longbow',
    name: 'Longbow',
    editions: ['2014', '2024'],
    description: 'A tall bow that requires strength and skill to use effectively.',
    category: 'weapon',
    weaponCategory: 'martial',
    weaponType: 'ranged',
    damage: '1d8',
    damageType: 'piercing',
    properties: ['ammunition', 'heavy', 'two-handed'],
    range: [150, 600],
    weight: 2,
    cost: 50,
  },
];

/**
 * Core pack armor
 */
export const armor: Armor[] = [
  // Light Armor
  {
    id: 'leather-armor',
    name: 'Leather Armor',
    editions: ['2014', '2024'],
    description: 'The breastplate and shoulder protectors are made of leather stiffened by boiling in oil.',
    category: 'armor',
    armorType: 'light',
    baseAC: 11,
    stealthDisadvantage: false,
    weight: 10,
    cost: 10,
  },

  // Medium Armor
  {
    id: 'chain-shirt',
    name: 'Chain Shirt',
    editions: ['2014', '2024'],
    description: 'Made of interlocking metal rings worn between layers of clothing.',
    category: 'armor',
    armorType: 'medium',
    baseAC: 13,
    maxDexBonus: 2,
    stealthDisadvantage: false,
    weight: 20,
    cost: 50,
  },
  {
    id: 'scale-mail',
    name: 'Scale Mail',
    editions: ['2014', '2024'],
    description: 'Armor made of overlapping metal scales.',
    category: 'armor',
    armorType: 'medium',
    baseAC: 14,
    maxDexBonus: 2,
    stealthDisadvantage: true,
    weight: 45,
    cost: 50,
  },

  // Heavy Armor
  {
    id: 'chain-mail',
    name: 'Chain Mail',
    editions: ['2014', '2024'],
    description: 'Made of interlocking metal rings, includes a layer of quilted fabric underneath.',
    category: 'armor',
    armorType: 'heavy',
    baseAC: 16,
    maxDexBonus: 0,
    strengthRequirement: 13,
    stealthDisadvantage: true,
    weight: 55,
    cost: 75,
  },

  // Shield
  {
    id: 'shield',
    name: 'Shield',
    editions: ['2014', '2024'],
    description: 'A shield made of wood or metal, strapped to the forearm.',
    category: 'shield',
    armorType: 'shield',
    baseAC: 2,
    stealthDisadvantage: false,
    weight: 6,
    cost: 10,
  },
];

/**
 * Core pack general equipment
 */
export const generalEquipment: GeneralEquipment[] = [
  // Adventuring Gear
  {
    id: 'backpack',
    name: 'Backpack',
    editions: ['2014', '2024'],
    description: 'A leather pack with straps to secure it to your back.',
    category: 'adventuring-gear',
    weight: 5,
    cost: 2,
  },
  {
    id: 'bedroll',
    name: 'Bedroll',
    editions: ['2014', '2024'],
    description: 'A simple sleeping bag or blankets for rest.',
    category: 'adventuring-gear',
    weight: 7,
    cost: 1,
  },
  {
    id: 'rations',
    name: 'Rations (1 day)',
    editions: ['2014', '2024'],
    description: 'Dried food suitable for extended travel.',
    category: 'adventuring-gear',
    weight: 2,
    cost: 0.5,
  },
  {
    id: 'rope-50ft',
    name: 'Rope, Hempen (50 feet)',
    editions: ['2014', '2024'],
    description: 'Strong rope useful for climbing, binding, and other tasks.',
    category: 'adventuring-gear',
    weight: 10,
    cost: 1,
  },
  {
    id: 'torch',
    name: 'Torch',
    editions: ['2014', '2024'],
    description: 'A torch burns for 1 hour, providing bright light in a 20-foot radius.',
    category: 'adventuring-gear',
    weight: 1,
    cost: 0.01,
  },
  {
    id: 'waterskin',
    name: 'Waterskin',
    editions: ['2014', '2024'],
    description: 'A leather pouch that holds 4 pints of liquid.',
    category: 'adventuring-gear',
    weight: 5,
    cost: 0.2,
  },

  // Tools
  {
    id: 'thieves-tools',
    name: "Thieves' Tools",
    editions: ['2014', '2024'],
    description: 'A set of tools for picking locks and disarming traps.',
    category: 'tool',
    weight: 1,
    cost: 25,
  },
  {
    id: 'component-pouch',
    name: 'Component Pouch',
    editions: ['2014', '2024'],
    description: 'A small pouch containing material components for spellcasting.',
    category: 'adventuring-gear',
    weight: 2,
    cost: 25,
  },
  {
    id: 'arcane-focus-crystal',
    name: 'Arcane Focus (Crystal)',
    editions: ['2014', '2024'],
    description: 'A crystal that can be used as a spellcasting focus.',
    category: 'adventuring-gear',
    weight: 1,
    cost: 10,
  },
  {
    id: 'holy-symbol',
    name: 'Holy Symbol',
    editions: ['2014', '2024'],
    description: 'A representation of a deity, used as a spellcasting focus for divine magic.',
    category: 'adventuring-gear',
    weight: 1,
    cost: 5,
  },

  // Packs
  {
    id: 'dungeoneers-pack',
    name: "Dungeoneer's Pack",
    editions: ['2014', '2024'],
    description: 'A pack with essential supplies for dungeon exploration.',
    category: 'pack',
    weight: 61.5,
    cost: 12,
    contents: [
      'Backpack',
      'Crowbar',
      'Hammer',
      'Pitons (10)',
      'Torches (10)',
      'Tinderbox',
      'Rations (10 days)',
      'Waterskin',
      'Rope, hempen (50 feet)',
    ],
  },
  {
    id: 'explorers-pack',
    name: "Explorer's Pack",
    editions: ['2014', '2024'],
    description: 'A pack for those who travel and explore the wilderness.',
    category: 'pack',
    weight: 59,
    cost: 10,
    contents: [
      'Backpack',
      'Bedroll',
      'Mess kit',
      'Tinderbox',
      'Torches (10)',
      'Rations (10 days)',
      'Waterskin',
      'Rope, hempen (50 feet)',
    ],
  },
  {
    id: 'scholars-pack',
    name: "Scholar's Pack",
    editions: ['2014', '2024'],
    description: 'A pack for the studious adventurer.',
    category: 'pack',
    weight: 10,
    cost: 40,
    contents: [
      'Backpack',
      'Book of lore',
      'Bottle of ink',
      'Ink pen',
      'Parchment (10 sheets)',
      'Little bag of sand',
      'Small knife',
    ],
  },
];

/**
 * All equipment combined
 */
export const equipment: Equipment[] = [
  ...weapons,
  ...armor,
  ...generalEquipment,
];

export default equipment;
