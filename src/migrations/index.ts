/**
 * Migrations index
 *
 * Import all migrations here to ensure they're registered.
 * Migrations are automatically registered when imported.
 */

export * from './types.js';
export * from './migrator.js';

// Import migrations to register them
// Add new migrations here as they're created
import './v1_to_v2.js';

// Re-export for convenience
export { default as v1_to_v2 } from './v1_to_v2.js';
