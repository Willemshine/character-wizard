import type { Spell } from '../types';

/**
 * Core pack spells
 * Includes 10 spells (mix of cantrips and 1st level) for both editions
 */
export const spells: Spell[] = [
  // === CANTRIPS (Level 0) ===

  // Fire Bolt
  {
    id: 'fire-bolt',
    name: 'Fire Bolt',
    editions: ['2014', '2024'],
    description: 'You hurl a mote of fire at a creature or object within range.',
    level: 0,
    school: 'Evocation',
    castingTime: { amount: 1, unit: 'action' },
    range: 120,
    components: { verbal: true, somatic: true, material: false },
    duration: { type: 'instantaneous' },
    classes: ['Wizard'],
    ritual: false,
    effect:
      'Make a ranged spell attack. On a hit, the target takes 1d10 fire damage. A flammable object hit by this spell ignites if it isn\'t being worn or carried. The damage increases by 1d10 at 5th, 11th, and 17th level.',
  },

  // Light
  {
    id: 'light',
    name: 'Light',
    editions: ['2014', '2024'],
    description: 'You touch one object and it sheds bright light.',
    level: 0,
    school: 'Evocation',
    castingTime: { amount: 1, unit: 'action' },
    range: 'touch',
    components: { verbal: true, somatic: false, material: true, materialDescription: 'a firefly or phosphorescent moss' },
    duration: { type: 'timed', amount: 1, unit: 'hour' },
    classes: ['Wizard'],
    ritual: false,
    effect:
      'You touch one object that is no larger than 10 feet in any dimension. The object sheds bright light in a 20-foot radius and dim light for an additional 20 feet.',
  },

  // Mage Hand
  {
    id: 'mage-hand',
    name: 'Mage Hand',
    editions: ['2014', '2024'],
    description: 'A spectral, floating hand appears at a point you choose within range.',
    level: 0,
    school: 'Conjuration',
    castingTime: { amount: 1, unit: 'action' },
    range: 30,
    components: { verbal: true, somatic: true, material: false },
    duration: { type: 'timed', amount: 1, unit: 'minute' },
    classes: ['Wizard'],
    ritual: false,
    effect:
      'A spectral hand appears that can manipulate objects, open doors, stow or retrieve items, or pour out containers. The hand can\'t attack, activate magic items, or carry more than 10 pounds.',
  },

  // Prestidigitation
  {
    id: 'prestidigitation',
    name: 'Prestidigitation',
    editions: ['2014', '2024'],
    description: 'This spell is a minor magical trick that novice spellcasters use for practice.',
    level: 0,
    school: 'Transmutation',
    castingTime: { amount: 1, unit: 'action' },
    range: 10,
    components: { verbal: true, somatic: true, material: false },
    duration: { type: 'timed', amount: 1, unit: 'hour' },
    classes: ['Wizard'],
    ritual: false,
    effect:
      'You create minor sensory effects, light or snuff small flames, clean or soil objects, chill or warm material, make a symbol appear, or create a trinket. You can have up to three effects active at once.',
  },

  // === 1ST LEVEL SPELLS ===

  // Magic Missile
  {
    id: 'magic-missile',
    name: 'Magic Missile',
    editions: ['2014', '2024'],
    description: 'You create three glowing darts of magical force.',
    level: 1,
    school: 'Evocation',
    castingTime: { amount: 1, unit: 'action' },
    range: 120,
    components: { verbal: true, somatic: true, material: false },
    duration: { type: 'instantaneous' },
    classes: ['Wizard'],
    ritual: false,
    effect:
      'Each dart hits a creature of your choice that you can see within range. A dart deals 1d4 + 1 force damage. The darts all strike simultaneously.',
    higherLevels:
      'When cast using a spell slot of 2nd level or higher, the spell creates one more dart for each slot level above 1st.',
  },

  // Shield
  {
    id: 'shield',
    name: 'Shield',
    editions: ['2014', '2024'],
    description: 'An invisible barrier of magical force appears and protects you.',
    level: 1,
    school: 'Abjuration',
    castingTime: {
      amount: 1,
      unit: 'reaction',
      reactionTrigger: 'when you are hit by an attack or targeted by the magic missile spell',
    },
    range: 'self',
    components: { verbal: true, somatic: true, material: false },
    duration: { type: 'timed', amount: 1, unit: 'round' },
    classes: ['Wizard'],
    ritual: false,
    effect:
      'You gain a +5 bonus to AC, including against the triggering attack, and you take no damage from magic missile. The bonus lasts until the start of your next turn.',
  },

  // Mage Armor
  {
    id: 'mage-armor',
    name: 'Mage Armor',
    editions: ['2014', '2024'],
    description: 'You touch a willing creature who isn\'t wearing armor, and a protective magical force surrounds it.',
    level: 1,
    school: 'Abjuration',
    castingTime: { amount: 1, unit: 'action' },
    range: 'touch',
    components: { verbal: true, somatic: true, material: true, materialDescription: 'a piece of cured leather' },
    duration: { type: 'timed', amount: 8, unit: 'hour' },
    classes: ['Wizard'],
    ritual: false,
    effect:
      'The target\'s base AC becomes 13 + its Dexterity modifier. The spell ends if the target dons armor or if you dismiss the spell as an action.',
  },

  // Sleep
  {
    id: 'sleep',
    name: 'Sleep',
    editions: ['2014', '2024'],
    description: 'This spell sends creatures into a magical slumber.',
    level: 1,
    school: 'Enchantment',
    castingTime: { amount: 1, unit: 'action' },
    range: 90,
    components: { verbal: true, somatic: true, material: true, materialDescription: 'a pinch of fine sand, rose petals, or a cricket' },
    duration: { type: 'timed', amount: 1, unit: 'minute' },
    classes: ['Wizard'],
    ritual: false,
    effect:
      'Roll 5d8; the total is how many hit points of creatures this spell can affect. Starting with the creature with the lowest current hit points, creatures fall unconscious. Undead and creatures immune to being charmed aren\'t affected.',
    higherLevels:
      'When cast using a spell slot of 2nd level or higher, roll an additional 2d8 for each slot level above 1st.',
  },

  // Detect Magic
  {
    id: 'detect-magic',
    name: 'Detect Magic',
    editions: ['2014', '2024'],
    description: 'For the duration, you sense the presence of magic within 30 feet of you.',
    level: 1,
    school: 'Divination',
    castingTime: { amount: 1, unit: 'action' },
    range: 'self',
    components: { verbal: true, somatic: true, material: false },
    duration: { type: 'concentration', amount: 10, unit: 'minute' },
    classes: ['Wizard'],
    ritual: true,
    effect:
      'You sense the presence of magic within 30 feet. As an action, you can see a faint aura around any visible creature or object that bears magic, and you learn its school of magic.',
  },

  // Find Familiar
  {
    id: 'find-familiar',
    name: 'Find Familiar',
    editions: ['2014', '2024'],
    description: 'You gain the service of a familiar, a spirit that takes an animal form you choose.',
    level: 1,
    school: 'Conjuration',
    castingTime: { amount: 1, unit: 'hour' },
    range: 10,
    components: {
      verbal: true,
      somatic: true,
      material: true,
      materialDescription: '10 gp worth of charcoal, incense, and herbs that must be consumed by fire in a brass brazier',
      materialCost: 10,
      materialConsumed: true,
    },
    duration: { type: 'instantaneous' },
    classes: ['Wizard'],
    ritual: true,
    effect:
      'You summon a familiar - a spirit in animal form (bat, cat, hawk, owl, etc.). The familiar acts independently but obeys your commands. You can communicate telepathically and see through its senses.',
  },
];

export default spells;
