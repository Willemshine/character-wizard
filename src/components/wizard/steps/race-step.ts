import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { stepStyles } from '../step-styles.ts';
import type { WizardFormState, StepValidationResult } from '../wizard-types.ts';
import type { RaceSelection } from '../../../types/character.ts';
import type { ModuleRace } from '../../../types/module.ts';
import { packLoader } from '../../../services/pack-loader.ts';

@customElement('race-step')
export class RaceStep extends LitElement {
  static styles = [stepStyles, css`
    .race-details {
      margin-top: var(--spacing-lg);
      padding: var(--spacing-lg);
      background: var(--color-surface);
      border-radius: var(--radius-md);
    }

    .race-details h3 {
      margin: 0 0 var(--spacing-md);
    }

    .trait-list {
      list-style: disc;
      padding-left: var(--spacing-lg);
      margin: var(--spacing-sm) 0;
    }

    .trait-list li {
      margin-bottom: var(--spacing-xs);
    }

    .stat-row {
      display: flex;
      gap: var(--spacing-lg);
      flex-wrap: wrap;
      margin-bottom: var(--spacing-md);
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--spacing-sm);
      background: var(--color-background);
      border-radius: var(--radius-sm);
      min-width: 60px;
    }

    .stat-item .label {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    .stat-item .value {
      font-size: var(--font-size-lg);
      font-weight: 600;
    }

    .ability-bonus {
      color: var(--color-success);
    }
  `];

  @property({ type: Object }) formState!: WizardFormState;
  @state() private races: ModuleRace[] = [];

  connectedCallback() {
    super.connectedCallback();
    this.races = packLoader.getAllRaces();
  }

  private dispatchUpdate(race: RaceSelection | null) {
    this.dispatchEvent(new CustomEvent('selection-update', {
      detail: { race },
      bubbles: true,
      composed: true,
    }));
  }

  static validate(formState: WizardFormState): StepValidationResult {
    const errors: string[] = [];
    const { character } = formState;

    if (!character.selections.race) {
      errors.push('Please select a race');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private handleRaceSelect(raceId: string) {
    const race = this.races.find(r => r.id === raceId);
    if (!race) return;

    this.dispatchUpdate({
      raceId,
      subraceId: undefined,
      traitChoices: {},
    });
  }

  private getSelectedRace(): ModuleRace | undefined {
    const raceId = this.formState.character.selections.race?.raceId;
    return this.races.find(r => r.id === raceId);
  }

  private renderAbilityBonuses(race: ModuleRace) {
    if (!race.abilityBonuses) return null;

    const bonuses = Object.entries(race.abilityBonuses)
      .filter(([, value]) => value !== 0);

    if (bonuses.length === 0) return null;

    return html`
      <div class="stat-row">
        ${bonuses.map(([ability, bonus]) => html`
          <div class="stat-item">
            <span class="label">${ability.slice(0, 3).toUpperCase()}</span>
            <span class="value ability-bonus">+${bonus}</span>
          </div>
        `)}
      </div>
    `;
  }

  private renderRaceDetails(race: ModuleRace) {
    return html`
      <div class="race-details">
        <h3>${race.name}</h3>
        <p>${race.description}</p>

        ${this.renderAbilityBonuses(race)}

        <div class="stat-row">
          <div class="stat-item">
            <span class="label">Speed</span>
            <span class="value">${race.speed} ft</span>
          </div>
          ${race.size ? html`
            <div class="stat-item">
              <span class="label">Size</span>
              <span class="value">${race.size}</span>
            </div>
          ` : ''}
        </div>

        ${race.traits.length > 0 ? html`
          <h4 class="section-title">Racial Traits</h4>
          <ul class="trait-list">
            ${race.traits.map(trait => html`<li>${trait}</li>`)}
          </ul>
        ` : ''}

        ${race.languages.length > 0 ? html`
          <h4 class="section-title">Languages</h4>
          <p>${race.languages.join(', ')}${race.languageChoice ? ` + ${race.languageChoice} of your choice` : ''}</p>
        ` : ''}

        ${race.hasSubraces ? html`
          <div class="info-box info">
            <p>This race has subraces. You'll choose your subrace in the next step.</p>
          </div>
        ` : ''}
      </div>
    `;
  }

  render() {
    const selectedRace = this.getSelectedRace();

    return html`
      <div class="step-container">
        <h2 class="step-title">Choose Your Race</h2>
        <p class="step-description">Your race determines your physical characteristics and some innate abilities.</p>

        ${this.races.length > 0 ? html`
          <div class="option-grid">
            ${this.races.map(race => html`
              <div
                class="option-card ${this.formState.character.selections.race?.raceId === race.id ? 'selected' : ''}"
                @click=${() => this.handleRaceSelect(race.id)}
              >
                <h4>${race.name}</h4>
                <p>${race.description.slice(0, 100)}${race.description.length > 100 ? '...' : ''}</p>
                <div class="details">
                  <span class="tag">Speed ${race.speed} ft</span>
                  ${race.size ? html`<span class="tag">${race.size}</span>` : ''}
                  ${race.hasSubraces ? html`<span class="tag">Has Subraces</span>` : ''}
                </div>
              </div>
            `)}
          </div>

          ${selectedRace ? this.renderRaceDetails(selectedRace) : ''}
        ` : html`
          <div class="empty-state">
            <p>No races available.</p>
            <p>Please enable module packs in the options menu.</p>
          </div>
        `}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'race-step': RaceStep;
  }
}
