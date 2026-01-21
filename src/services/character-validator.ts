import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import type { Character, CharacterState } from '../types/index.ts';

// Simplified schema for Character (v1 legacy format)
const characterV1Schema = {
  type: 'object',
  required: ['id', 'name', 'race', 'class', 'level'],
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    race: { type: 'string' },
    class: { type: 'string' },
    level: { type: 'integer', minimum: 1, maximum: 20 },
    background: { type: 'string' },
    abilityScores: {
      type: 'object',
      properties: {
        strength: { type: 'integer' },
        dexterity: { type: 'integer' },
        constitution: { type: 'integer' },
        intelligence: { type: 'integer' },
        wisdom: { type: 'integer' },
        charisma: { type: 'integer' },
      },
    },
    hitPoints: { type: 'integer' },
    maxHitPoints: { type: 'integer' },
    armorClass: { type: 'integer' },
    proficiencyBonus: { type: 'integer' },
    skills: { type: 'array', items: { type: 'string' } },
    equipment: { type: 'array', items: { type: 'string' } },
    features: { type: 'array', items: { type: 'string' } },
    spells: { type: 'array', items: { type: 'string' } },
    notes: { type: 'string' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
  },
};

// Simplified schema for CharacterState (v2 format)
const characterV2Schema = {
  type: 'object',
  required: [
    'id',
    'schemaVersion',
    'appVersion',
    'edition',
    'level',
    'name',
    'selections',
    'derived',
    'currentState',
    'enabledModules',
    'notes',
    'createdAt',
    'updatedAt',
  ],
  properties: {
    id: { type: 'string' },
    schemaVersion: { type: 'integer', minimum: 1 },
    appVersion: { type: 'string' },
    edition: { type: 'string', enum: ['5e', '5e-2024', 'custom'] },
    level: { type: 'integer', minimum: 1, maximum: 20 },
    name: { type: 'string' },
    playerName: { type: 'string' },
    experiencePoints: { type: 'integer', minimum: 0 },
    selections: { type: 'object' },
    derived: { type: 'object' },
    currentState: { type: 'object' },
    enabledModules: { type: 'array' },
    notes: { type: 'string' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
  },
};

export interface ValidationResult {
  valid: boolean;
  character: Character | CharacterState | null;
  version: 'v1' | 'v2' | null;
  errors: string[];
}

class CharacterValidator {
  private ajv: Ajv;
  private validateV1: ReturnType<Ajv['compile']>;
  private validateV2: ReturnType<Ajv['compile']>;

  constructor() {
    this.ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(this.ajv);
    this.validateV1 = this.ajv.compile(characterV1Schema);
    this.validateV2 = this.ajv.compile(characterV2Schema);
  }

  validate(data: unknown): ValidationResult {
    // Try to detect version based on schemaVersion field
    if (typeof data === 'object' && data !== null) {
      const obj = data as Record<string, unknown>;

      // Check if it's v2 format (has schemaVersion)
      if ('schemaVersion' in obj) {
        const valid = this.validateV2(data);
        if (valid) {
          return {
            valid: true,
            character: data as CharacterState,
            version: 'v2',
            errors: [],
          };
        }
        return {
          valid: false,
          character: null,
          version: 'v2',
          errors: this.formatErrors(this.validateV2.errors),
        };
      }

      // Check if it's v1 format (has race/class as strings)
      if ('race' in obj && 'class' in obj && typeof obj.race === 'string') {
        const valid = this.validateV1(data);
        if (valid) {
          return {
            valid: true,
            character: data as Character,
            version: 'v1',
            errors: [],
          };
        }
        return {
          valid: false,
          character: null,
          version: 'v1',
          errors: this.formatErrors(this.validateV1.errors),
        };
      }
    }

    return {
      valid: false,
      character: null,
      version: null,
      errors: ['Invalid character format: could not determine schema version'],
    };
  }

  private formatErrors(errors: ReturnType<Ajv['compile']>['errors']): string[] {
    if (!errors) return [];
    return errors.map((e) => {
      const path = e.instancePath || '/';
      return `${path}: ${e.message}`;
    });
  }

  parseAndValidate(jsonString: string): ValidationResult {
    try {
      const data = JSON.parse(jsonString);
      return this.validate(data);
    } catch (e) {
      return {
        valid: false,
        character: null,
        version: null,
        errors: [`Invalid JSON: ${e instanceof Error ? e.message : 'Parse error'}`],
      };
    }
  }
}

export const characterValidator = new CharacterValidator();
