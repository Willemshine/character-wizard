/**
 * Character Wizard - Core Pack
 *
 * A minimal D&D character creation data pack supporting both
 * 2014 and 2024 edition rules.
 *
 * @example
 * ```typescript
 * import { loadEditionPack, filterClasses } from 'character-wizard';
 *
 * // Load all content for 2024 edition
 * const pack = loadEditionPack('2024');
 *
 * // Get only caster classes
 * const casters = filterClasses(pack.classes, '2024', { isCaster: true });
 * ```
 */

// Types
export * from './types';

// Data
export * from './data';

// Services
export * from './services';
