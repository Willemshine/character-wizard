/**
 * Character state migrator
 * Handles upgrading character data from older schema versions
 */

import type { CharacterState } from '../types/character.js';
import type { AnyMigration, MigrationResult } from './types.js';

class MigrationRegistry {
  private migrations: Map<number, AnyMigration> = new Map();

  register(migration: AnyMigration): void {
    if (this.migrations.has(migration.fromVersion)) {
      throw new Error(
        `Migration from version ${migration.fromVersion} already registered`
      );
    }
    this.migrations.set(migration.fromVersion, migration);
  }

  get(fromVersion: number): AnyMigration | undefined {
    return this.migrations.get(fromVersion);
  }

  getAll(): AnyMigration[] {
    return Array.from(this.migrations.values()).sort(
      (a, b) => a.fromVersion - b.fromVersion
    );
  }

  has(fromVersion: number): boolean {
    return this.migrations.has(fromVersion);
  }
}

export const registry = new MigrationRegistry();

/**
 * Extract schema version from data
 */
function getSchemaVersion(data: unknown): number | null {
  if (
    data &&
    typeof data === 'object' &&
    'schemaVersion' in data &&
    typeof (data as Record<string, unknown>).schemaVersion === 'number'
  ) {
    return (data as Record<string, unknown>).schemaVersion as number;
  }
  return null;
}

/**
 * Migrate character data to the target version
 */
export function migrateCharacter(
  data: unknown,
  targetVersion: number
): MigrationResult<CharacterState> {
  const migrationsApplied: number[] = [];

  const currentVersion = getSchemaVersion(data);
  if (currentVersion === null) {
    return {
      success: false,
      error: 'Invalid data: missing or invalid schemaVersion',
      migrationsApplied,
    };
  }

  if (currentVersion === targetVersion) {
    return {
      success: true,
      data: data as CharacterState,
      migrationsApplied,
    };
  }

  if (currentVersion > targetVersion) {
    return {
      success: false,
      error: `Cannot downgrade from version ${currentVersion} to ${targetVersion}`,
      migrationsApplied,
    };
  }

  let currentData = data;
  let version = currentVersion;

  while (version < targetVersion) {
    const migration = registry.get(version);

    if (!migration) {
      return {
        success: false,
        error: `No migration found for version ${version}`,
        migrationsApplied,
      };
    }

    if (migration.validate && !migration.validate(currentData)) {
      return {
        success: false,
        error: `Data validation failed for migration from version ${version}`,
        migrationsApplied,
      };
    }

    try {
      currentData = migration.migrate(currentData);
      migrationsApplied.push(version);
      version = migration.toVersion;
    } catch (error) {
      return {
        success: false,
        error: `Migration from version ${version} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        migrationsApplied,
      };
    }
  }

  return {
    success: true,
    data: currentData as CharacterState,
    migrationsApplied,
  };
}

/**
 * Check if data needs migration
 */
export function needsMigration(data: unknown, targetVersion: number): boolean {
  const currentVersion = getSchemaVersion(data);
  return currentVersion !== null && currentVersion < targetVersion;
}

/**
 * Get required migrations for data
 */
export function getRequiredMigrations(
  data: unknown,
  targetVersion: number
): AnyMigration[] {
  const currentVersion = getSchemaVersion(data);
  if (currentVersion === null || currentVersion >= targetVersion) {
    return [];
  }

  const required: AnyMigration[] = [];
  let version = currentVersion;

  while (version < targetVersion) {
    const migration = registry.get(version);
    if (!migration) break;
    required.push(migration);
    version = migration.toVersion;
  }

  return required;
}
