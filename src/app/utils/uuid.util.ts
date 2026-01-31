import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a random UUID v4 string for unique identification.
 * Used primarily for Preset IDs.
 */
export function generateUUID(): string {
  return uuidv4();
}
