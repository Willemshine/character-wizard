/**
 * Character Migration System
 *
 * Handles automatic migration of character data between schema versions.
 * Each migration transforms data from version N to version N+1.
 */

import type { CharacterState } from '../types/character.ts';
import { CURRENT_SCHEMA_VERSION } from '../types/character.ts';

export interface Migration {
  fromVersion: number;
  toVersion: number;
  migrate: (data: unknown) => unknown;
  description: string;
}

/**
 * Migration registry - migrations are registered in order
 */
const migrations: Migration[] = [];

/**
 * Register a migration function
 */
export function registerMigration(migration: Migration): void {
  // Validate migration
  if (migration.toVersion !== migration.fromVersion + 1) {
    throw new Error(
      `Migration must increment version by 1. Got ${migration.fromVersion} -> ${migration.toVersion}`
    );
  }

  // Check for duplicates
  const existing = migrations.find(m => m.fromVersion === migration.fromVersion);
  if (existing) {
    throw new Error(`Migration from version ${migration.fromVersion} already registered`);
  }

  // Insert in order
  const insertIndex = migrations.findIndex(m => m.fromVersion > migration.fromVersion);
  if (insertIndex === -1) {
    migrations.push(migration);
  } else {
    migrations.splice(insertIndex, 0, migration);
  }
}

/**
 * Get the schema version from character data
 */
export function getSchemaVersion(data: unknown): number {
  if (typeof data !== 'object' || data === null) {
    return 1; // Assume v1 for invalid data
  }

  const obj = data as Record<string, unknown>;

  // Check for explicit schemaVersion
  if (typeof obj.schemaVersion === 'number') {
    return obj.schemaVersion;
  }

  // Detect v1 format (has race/class as strings, no selections object)
  if (
    typeof obj.race === 'string' &&
    typeof obj.class === 'string' &&
    !('selections' in obj)
  ) {
    return 1;
  }

  // Default to current version for unrecognized formats
  return CURRENT_SCHEMA_VERSION;
}

/**
 * Check if character data needs migration
 */
export function needsMigration(data: unknown): boolean {
  const version = getSchemaVersion(data);
  return version < CURRENT_SCHEMA_VERSION;
}

/**
 * Get list of migrations needed for a given version
 */
export function getMigrationPath(fromVersion: number): Migration[] {
  return migrations.filter(
    m => m.fromVersion >= fromVersion && m.toVersion <= CURRENT_SCHEMA_VERSION
  );
}

/**
 * Migrate character data to the current schema version
 * Returns the migrated data and a log of applied migrations
 */
export function migrateCharacter(data: unknown): {
  data: CharacterState;
  migrationsApplied: string[];
  originalVersion: number;
} {
  const originalVersion = getSchemaVersion(data);
  let currentData = structuredClone(data);
  const migrationsApplied: string[] = [];

  const path = getMigrationPath(originalVersion);

  for (const migration of path) {
    try {
      currentData = migration.migrate(currentData);
      migrationsApplied.push(
        `v${migration.fromVersion} -> v${migration.toVersion}: ${migration.description}`
      );
    } catch (error) {
      throw new Error(
        `Migration failed (v${migration.fromVersion} -> v${migration.toVersion}): ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  return {
    data: currentData as CharacterState,
    migrationsApplied,
    originalVersion,
  };
}

/**
 * Validate that all registered migrations form a complete chain
 */
export function validateMigrationChain(): { valid: boolean; gaps: number[] } {
  const gaps: number[] = [];

  for (let v = 1; v < CURRENT_SCHEMA_VERSION; v++) {
    const hasMigration = migrations.some(m => m.fromVersion === v);
    if (!hasMigration) {
      gaps.push(v);
    }
  }

  return {
    valid: gaps.length === 0,
    gaps,
  };
}

/**
 * Get information about registered migrations
 */
export function getMigrationInfo(): {
  registered: Array<{ from: number; to: number; description: string }>;
  currentVersion: number;
  chainValid: boolean;
} {
  return {
    registered: migrations.map(m => ({
      from: m.fromVersion,
      to: m.toVersion,
      description: m.description,
    })),
    currentVersion: CURRENT_SCHEMA_VERSION,
    chainValid: validateMigrationChain().valid,
  };
}

// Import and register all migrations
import './v1_to_v2.ts';
