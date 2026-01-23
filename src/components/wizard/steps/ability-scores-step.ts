import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { stepStyles } from '../step-styles.ts';
import type { WizardFormState, StepValidationResult } from '../wizard-types.ts';
import {
  type AbilityScoreSelection,
  type AbilityScoreMethod,
  type AbilityScores,
  type AbilityName,
  ABILITY_NAMES,
  calculateModifier,
} from '../../../types/character.ts';
import { packLoader } from '../../../services/pack-loader.ts';

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];
const POINT_BUY_COSTS: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9,
};
const POINT_BUY_TOTAL = 27;

/**
 * Seeded random number generator using Mulberry32 algorithm
 * Returns a function that generates numbers between 0 and 1
 */
function createSeededRng(seed: number): () => number {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Roll dice using a seeded RNG
 */
function rollDiceSeeded(rng: () => number, count: number, sides: number, dropLowest: number = 0): { rolls: number[]; total: number } {
  const rolls = Array.from({ length: count }, () => Math.floor(rng() * sides) + 1);
  const sortedRolls = [...rolls].sort((a, b) => b - a);
  const keptRolls = sortedRolls.slice(0, count - dropLowest);
  const total = keptRolls.reduce((a, b) => a + b, 0);
  return { rolls, total };
}

/**
 * Generate a random seed
 */
function generateSeed(): number {
  return Math.floor(Math.random() * 2147483647) + 1;
}

@customElement('ability-scores-step')
export class AbilityScoresStep extends LitElement {
  static styles = [stepStyles, css`
    .method-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-xl);
    }

    .ability-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-lg);
      margin: var(--spacing-lg) 0;
    }

    @media (max-width: 600px) {
      .ability-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .ability-card {
      background: var(--color-surface);
      border-radius: var(--radius-md);
      padding: var(--spacing-md);
      text-align: center;
    }

    .ability-card h4 {
      margin: 0 0 var(--spacing-sm);
      font-size: var(--font-size-sm);
      text-transform: uppercase;
      color: var(--color-text-secondary);
    }

    .ability-card .score-input {
      width: 60px;
      padding: var(--spacing-sm);
      text-align: center;
      font-size: var(--font-size-xl);
      font-weight: 600;
      border: 2px solid var(--color-border);
      border-radius: var(--radius-sm);
    }

    .ability-card .score-input:focus {
      border-color: var(--color-primary);
      outline: none;
    }

    .ability-card .modifier {
      margin-top: var(--spacing-sm);
      font-size: var(--font-size-lg);
      color: var(--color-primary);
      font-weight: 600;
    }

    .ability-card .modifier.negative {
      color: var(--color-danger);
    }

    .ability-card .bonuses {
      font-size: var(--font-size-sm);
      color: var(--color-success);
      margin-top: var(--spacing-xs);
    }

    .ability-card select {
      width: 70px;
      padding: var(--spacing-sm);
      font-size: var(--font-size-lg);
      text-align: center;
    }

    .point-buy-info {
      text-align: center;
      padding: var(--spacing-md);
      background: var(--color-surface);
      border-radius: var(--radius-md);
      margin-bottom: var(--spacing-lg);
    }

    .point-buy-info .points {
      font-size: var(--font-size-xl);
      font-weight: 600;
    }

    .point-buy-info .points.over {
      color: var(--color-danger);
    }

    .roll-section {
      background: var(--color-surface);
      border-radius: var(--radius-md);
      padding: var(--spacing-lg);
      margin-bottom: var(--spacing-lg);
    }

    .roll-controls {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-md);
      align-items: center;
      justify-content: center;
      margin-bottom: var(--spacing-md);
    }

    .seed-input-group {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .seed-input-group label {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    .seed-input {
      width: 120px;
      padding: var(--spacing-sm);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      font-size: var(--font-size-md);
      font-family: monospace;
      text-align: center;
    }

    .seed-input:focus {
      border-color: var(--color-primary);
      outline: none;
    }

    .roll-button {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md) var(--spacing-xl);
      background: var(--color-primary);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-size: var(--font-size-md);
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .roll-button:hover {
      background: var(--color-primary-dark);
    }

    .roll-button.secondary {
      background: var(--color-surface);
      color: var(--color-text-primary);
      border: 1px solid var(--color-border);
    }

    .roll-button.secondary:hover {
      background: var(--color-background);
      border-color: var(--color-primary);
    }

    .dice-rolls {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin-top: var(--spacing-xs);
    }

    .dice-rolls .dropped {
      text-decoration: line-through;
      opacity: 0.5;
    }

    .dice-icon {
      font-size: 1.2em;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: var(--spacing-md);
      background: var(--color-background);
      border-radius: var(--radius-md);
      margin-top: var(--spacing-lg);
    }

    .standard-array-pool {
      display: flex;
      gap: var(--spacing-sm);
      justify-content: center;
      margin-bottom: var(--spacing-lg);
      flex-wrap: wrap;
    }

    .pool-value {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-surface);
      border: 2px solid var(--color-border);
      border-radius: var(--radius-sm);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .pool-value.used {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .pool-value:not(.used):hover {
      border-color: var(--color-primary);
      background: rgba(92, 107, 192, 0.1);
    }
  `];

  @property({ type: Object }) formState!: WizardFormState;

  /** Track individual dice rolls for display */
  @state() private diceRolls: Record<AbilityName, number[]> = {
    strength: [],
    dexterity: [],
    constitution: [],
    intelligence: [],
    wisdom: [],
    charisma: [],
  };

  private dispatchUpdate(abilityScores: AbilityScoreSelection) {
    this.dispatchEvent(new CustomEvent('selection-update', {
      detail: { abilityScores },
      bubbles: true,
      composed: true,
    }));
  }

  static validate(formState: WizardFormState): StepValidationResult {
    const errors: string[] = [];
    const { character } = formState;
    const { abilityScores } = character.selections;

    // Check if all scores are within valid range
    for (const ability of ABILITY_NAMES) {
      const score = abilityScores.baseScores[ability];
      if (score < 1 || score > 20) {
        errors.push(`${ability} must be between 1 and 20`);
      }
    }

    // For standard array, check that all values are assigned
    if (abilityScores.method === 'standard-array') {
      const usedValues = Object.values(abilityScores.baseScores).sort((a, b) => b - a);
      const sortedArray = [...STANDARD_ARRAY].sort((a, b) => b - a);
      const isValid = usedValues.every((v, i) => v === sortedArray[i]);
      if (!isValid) {
        errors.push('Please assign all standard array values');
      }
    }

    // For point buy, check points used
    if (abilityScores.method === 'point-buy') {
      const pointsUsed = Object.values(abilityScores.baseScores)
        .reduce((sum, score) => sum + (POINT_BUY_COSTS[score] ?? 0), 0);
      if (pointsUsed > POINT_BUY_TOTAL) {
        errors.push(`You've used too many points (${pointsUsed}/${POINT_BUY_TOTAL})`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private handleMethodChange(method: AbilityScoreMethod) {
    const current = this.formState.character.selections.abilityScores;

    let baseScores: AbilityScores;
    if (method === 'standard-array') {
      baseScores = { strength: 15, dexterity: 14, constitution: 13, intelligence: 12, wisdom: 10, charisma: 8 };
    } else if (method === 'point-buy') {
      baseScores = { strength: 8, dexterity: 8, constitution: 8, intelligence: 8, wisdom: 8, charisma: 8 };
    } else {
      baseScores = { ...current.baseScores };
    }

    this.dispatchUpdate({
      ...current,
      method,
      baseScores,
    });
  }

  private handleScoreChange(ability: AbilityName, value: number) {
    const current = this.formState.character.selections.abilityScores;
    this.dispatchUpdate({
      ...current,
      baseScores: {
        ...current.baseScores,
        [ability]: value,
      },
    });
  }

  private handleRollScores(newSeed?: number) {
    const current = this.formState.character.selections.abilityScores;
    const method = current.method;
    const seed = newSeed ?? current.rollSeed ?? generateSeed();
    const rng = createSeededRng(seed);

    const newScores: AbilityScores = {} as AbilityScores;
    const newDiceRolls: Record<AbilityName, number[]> = {} as Record<AbilityName, number[]>;

    for (const ability of ABILITY_NAMES) {
      if (method === 'roll-4d6-drop-lowest') {
        const result = rollDiceSeeded(rng, 4, 6, 1);
        newScores[ability] = result.total;
        newDiceRolls[ability] = result.rolls;
      } else if (method === 'roll-3d6') {
        const result = rollDiceSeeded(rng, 3, 6, 0);
        newScores[ability] = result.total;
        newDiceRolls[ability] = result.rolls;
      } else {
        newScores[ability] = current.baseScores[ability];
        newDiceRolls[ability] = [];
      }
    }

    this.diceRolls = newDiceRolls;

    this.dispatchUpdate({
      ...current,
      baseScores: newScores,
      rollSeed: seed,
    });
  }

  private handleReroll() {
    const newSeed = generateSeed();
    this.handleRollScores(newSeed);
  }

  private handleSeedChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const seed = parseInt(input.value, 10);
    if (!isNaN(seed) && seed > 0) {
      this.handleRollScores(seed);
    }
  }

  private getRacialBonuses(): Partial<AbilityScores> {
    const raceId = this.formState.character.selections.race?.raceId;
    const subraceId = this.formState.character.selections.race?.subraceId;

    const bonuses: Partial<AbilityScores> = {};

    if (raceId) {
      const races = packLoader.getAllRaces();
      const race = races.find(r => r.id === raceId);
      if (race?.abilityBonuses) {
        Object.assign(bonuses, race.abilityBonuses);
      }

      if (subraceId) {
        const subraces = packLoader.getSubracesForRace(raceId);
        const subrace = subraces.find(s => s.id === subraceId);
        if (subrace?.abilityBonuses) {
          for (const [ability, bonus] of Object.entries(subrace.abilityBonuses)) {
            bonuses[ability as AbilityName] = (bonuses[ability as AbilityName] ?? 0) + (bonus ?? 0);
          }
        }
      }
    }

    return bonuses;
  }

  private getPointsUsed(): number {
    const { baseScores } = this.formState.character.selections.abilityScores;
    return Object.values(baseScores)
      .reduce((sum, score) => sum + (POINT_BUY_COSTS[score] ?? 0), 0);
  }

  private renderMethodSelector() {
    const methods: { id: AbilityScoreMethod; name: string; desc: string }[] = [
      { id: 'standard-array', name: 'Standard Array', desc: '15, 14, 13, 12, 10, 8' },
      { id: 'point-buy', name: 'Point Buy', desc: '27 points to spend' },
      { id: 'manual', name: 'Manual Entry', desc: 'Enter values directly' },
      { id: 'roll-4d6-drop-lowest', name: 'Roll 4d6', desc: 'Drop lowest die' },
      { id: 'roll-3d6', name: 'Roll 3d6', desc: 'Classic method' },
    ];

    const currentMethod = this.formState.character.selections.abilityScores.method;

    return html`
      <div class="method-cards">
        ${methods.map(method => html`
          <div
            class="option-card ${currentMethod === method.id ? 'selected' : ''}"
            @click=${() => this.handleMethodChange(method.id)}
          >
            <h4>${method.name}</h4>
            <p>${method.desc}</p>
          </div>
        `)}
      </div>
    `;
  }

  private renderAbilityInput(ability: AbilityName) {
    const { abilityScores } = this.formState.character.selections;
    const baseScore = abilityScores.baseScores[ability];
    const racialBonuses = this.getRacialBonuses();
    const bonus = racialBonuses[ability] ?? 0;
    const totalScore = baseScore + bonus;
    const modifier = calculateModifier(totalScore);
    const modifierStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
    const isRollMethod = abilityScores.method === 'roll-4d6-drop-lowest' || abilityScores.method === 'roll-3d6';
    const diceRolls = this.diceRolls[ability] || [];

    return html`
      <div class="ability-card">
        <h4>${ability}</h4>
        ${abilityScores.method === 'standard-array' ? html`
          <select
            .value=${String(baseScore)}
            @change=${(e: Event) => this.handleScoreChange(ability, parseInt((e.target as HTMLSelectElement).value))}
          >
            ${STANDARD_ARRAY.map(value => html`
              <option value=${value}>${value}</option>
            `)}
          </select>
        ` : abilityScores.method === 'point-buy' ? html`
          <select
            .value=${String(baseScore)}
            @change=${(e: Event) => this.handleScoreChange(ability, parseInt((e.target as HTMLSelectElement).value))}
          >
            ${Object.keys(POINT_BUY_COSTS).map(value => html`
              <option value=${value}>${value} (${POINT_BUY_COSTS[parseInt(value)]} pts)</option>
            `)}
          </select>
        ` : html`
          <input
            type="number"
            class="score-input"
            min="1"
            max="20"
            .value=${String(baseScore)}
            @input=${(e: Event) => this.handleScoreChange(ability, parseInt((e.target as HTMLInputElement).value) || 8)}
          />
        `}
        ${isRollMethod && diceRolls.length > 0 ? html`
          <div class="dice-rolls">
            ${this.renderDiceRolls(diceRolls, abilityScores.method === 'roll-4d6-drop-lowest')}
          </div>
        ` : ''}
        ${bonus > 0 ? html`
          <div class="bonuses">+${bonus} racial</div>
        ` : ''}
        <div class="modifier ${modifier < 0 ? 'negative' : ''}">
          ${modifierStr}
        </div>
        ${bonus > 0 ? html`
          <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">
            Total: ${totalScore}
          </div>
        ` : ''}
      </div>
    `;
  }

  private renderDiceRolls(rolls: number[], dropLowest: boolean) {
    if (rolls.length === 0) return '';

    const sortedRolls = [...rolls].sort((a, b) => b - a);
    const minRoll = Math.min(...rolls);
    let droppedOne = false;

    return html`
      [${sortedRolls.map((roll, index) => {
        const isDropped = dropLowest && roll === minRoll && !droppedOne && index === sortedRolls.length - 1;
        if (isDropped) droppedOne = true;
        return html`<span class="${isDropped ? 'dropped' : ''}">${roll}</span>${index < sortedRolls.length - 1 ? ', ' : ''}`;
      })}]
    `;
  }

  render() {
    const { abilityScores } = this.formState.character.selections;
    const isRollMethod = abilityScores.method === 'roll-4d6-drop-lowest' || abilityScores.method === 'roll-3d6';

    return html`
      <div class="step-container">
        <h2 class="step-title">Ability Scores</h2>
        <p class="step-description">
          Choose how to determine your ability scores and assign them to your six abilities.
        </p>

        ${this.renderMethodSelector()}

        ${abilityScores.method === 'point-buy' ? html`
          <div class="point-buy-info">
            Points used:
            <span class="points ${this.getPointsUsed() > POINT_BUY_TOTAL ? 'over' : ''}">
              ${this.getPointsUsed()} / ${POINT_BUY_TOTAL}
            </span>
          </div>
        ` : ''}

        ${isRollMethod ? html`
          <div class="roll-section">
            <div class="roll-controls">
              <div class="seed-input-group">
                <label for="seed-input">Seed:</label>
                <input
                  id="seed-input"
                  type="number"
                  class="seed-input"
                  .value=${String(abilityScores.rollSeed ?? '')}
                  placeholder="Random"
                  @change=${this.handleSeedChange}
                />
              </div>
              <button class="roll-button" @click=${() => this.handleRollScores(abilityScores.rollSeed)}>
                <span class="dice-icon">🎲</span>
                Roll with Seed
              </button>
              <button class="roll-button secondary" @click=${this.handleReroll}>
                <span class="dice-icon">🔄</span>
                Reroll (New Seed)
              </button>
            </div>
            ${abilityScores.rollSeed ? html`
              <p style="text-align: center; margin: 0; font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                Using seed: <code>${abilityScores.rollSeed}</code>
                — share this seed to reproduce these exact rolls
              </p>
            ` : html`
              <p style="text-align: center; margin: 0; font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                Click a roll button to generate ability scores
              </p>
            `}
          </div>
        ` : ''}

        <div class="ability-grid">
          ${ABILITY_NAMES.map(ability => this.renderAbilityInput(ability))}
        </div>

        <div class="total-row">
          <span>Total Base Scores</span>
          <strong>${Object.values(abilityScores.baseScores).reduce((a, b) => a + b, 0)}</strong>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ability-scores-step': AbilityScoresStep;
  }
}
