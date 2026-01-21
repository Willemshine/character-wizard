/**
 * Supported D&D editions
 * - 2014: D&D 5th Edition (2014 Player's Handbook)
 * - 2024: D&D 5th Edition (2024 revised rules)
 */
export type Edition = '2014' | '2024';

export const EDITIONS: readonly Edition[] = ['2014', '2024'] as const;

/**
 * Base interface for all edition-aware content
 */
export interface EditionContent {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Which editions this content is available in */
  editions: Edition[];
  /** Optional description */
  description?: string;
}

/**
 * Check if content is available for a specific edition
 */
export function isAvailableForEdition<T extends EditionContent>(
  content: T,
  edition: Edition
): boolean {
  return content.editions.includes(edition);
}
