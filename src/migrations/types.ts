/**
 * Migration system types
 */

export interface Migration<TFrom = unknown, TTo = unknown> {
  /** Source schema version */
  fromVersion: number;
  /** Target schema version */
  toVersion: number;
  /** Migration description */
  description: string;
  /** Perform the migration */
  migrate(data: TFrom): TTo;
  /** Optional: validate input before migration */
  validate?(data: unknown): data is TFrom;
}

export interface MigrationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  migrationsApplied: number[];
}

export type AnyMigration = Migration<unknown, unknown>;
