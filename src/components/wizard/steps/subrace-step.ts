import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { stepStyles } from '../step-styles.ts';
import type { WizardFormState, StepValidationResult } from '../wizard-types.ts';
import type { ModuleSubrace, ModuleRace } from '../../../types/module.ts';
import { packLoader } from '../../../services/pack-loader.ts';

@customElement('subrace-step')
export class SubraceStep extends LitElement {
  static styles = [stepStyles, css`
    .subrace-details {
      margin-top: var(--spacing-lg);
      padding: var(--spacing-lg);
      background: var(--color-surface);
      border-radius: var(--radius-md);
    }

    .trait-list {
      list-style: disc;
      padding-left: var(--spacing-lg);
      margin: var(--spacing-sm) 0;
    }

    .ability-bonus {
      color: var(--color-success);
      font-weight: 600;
    }
  `];

  @property({ type: Object }) formState!: WizardFormState;
  @state() private subraces: ModuleSubrace[] = [];
  @state() private parentRace: ModuleRace | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.loadSubraces();
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('formState')) {
      this.loadSubraces();
    }
  }

  private loadSubraces() {
    const raceId = this.formState.character.selections.race?.raceId;
    if (raceId) {
      this.subraces = packLoader.getSubracesForRace(raceId);
      const races = packLoader.getAllRaces();
      this.parentRace = races.find(r => r.id === raceId) ?? null;
    } else {
      this.subraces = [];
      this.parentRace = null;
    }
  }

  private dispatchUpdate(subraceId: string | undefined) {
    const currentRace = this.formState.character.selections.race;
    if (!currentRace) return;

    this.dispatchEvent(new CustomEvent('selection-update', {
      detail: {
        race: {
          ...currentRace,
          subraceId,
        },
      },
      bubbles: true,
      composed: true,
    }));
  }

  static validate(formState: WizardFormState): StepValidationResult {
    const errors: string[] = [];
    const { character } = formState;

    // Check if parent race has subraces
    const raceId = character.selections.race?.raceId;
    if (raceId) {
      const subraces = packLoader.getSubracesForRace(raceId);
      if (subraces.length > 0 && !character.selections.race?.subraceId) {
        errors.push('Please select a subrace');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static shouldShow(formState: WizardFormState): boolean {
    const raceId = formState.character.selections.race?.raceId;
    if (!raceId) return false;

    const subraces = packLoader.getSubracesForRace(raceId);
    return subraces.length > 0;
  }

  private handleSubraceSelect(subraceId: string) {
    this.dispatchUpdate(subraceId);
  }

  private getSelectedSubrace(): ModuleSubrace | undefined {
    const subraceId = this.formState.character.selections.race?.subraceId;
    return this.subraces.find(s => s.id === subraceId);
  }

  private renderSubraceDetails(subrace: ModuleSubrace) {
    return html`
      <div class="subrace-details">
        <h3>${subrace.name}</h3>
        ${subrace.description ? html`<p>${subrace.description}</p>` : ''}

        ${subrace.abilityBonuses ? html`
          <h4 class="section-title">Ability Score Bonuses</h4>
          <p>
            ${Object.entries(subrace.abilityBonuses)
              .filter(([, value]) => value !== 0)
              .map(([ability, bonus]) =>
                html`<span class="ability-bonus">${ability}: +${bonus}</span> `
              )}
          </p>
        ` : ''}

        ${subrace.traits && subrace.traits.length > 0 ? html`
          <h4 class="section-title">Subrace Traits</h4>
          <ul class="trait-list">
            ${subrace.traits.map(trait => html`<li>${trait}</li>`)}
          </ul>
        ` : ''}
      </div>
    `;
  }

  render() {
    if (!this.parentRace) {
      return html`
        <div class="step-container">
          <div class="info-box warning">
            <p>Please select a race first.</p>
          </div>
        </div>
      `;
    }

    if (this.subraces.length === 0) {
      return html`
        <div class="step-container">
          <h2 class="step-title">Subrace</h2>
          <div class="info-box info">
            <p>${this.parentRace.name} does not have subraces. You can proceed to the next step.</p>
          </div>
        </div>
      `;
    }

    const selectedSubrace = this.getSelectedSubrace();

    return html`
      <div class="step-container">
        <h2 class="step-title">Choose Your Subrace</h2>
        <p class="step-description">
          As a ${this.parentRace.name}, you can choose from the following subraces.
        </p>

        <div class="option-grid">
          ${this.subraces.map(subrace => html`
            <div
              class="option-card ${this.formState.character.selections.race?.subraceId === subrace.id ? 'selected' : ''}"
              @click=${() => this.handleSubraceSelect(subrace.id)}
            >
              <h4>${subrace.name}</h4>
              ${subrace.description ? html`
                <p>${subrace.description.slice(0, 100)}${subrace.description.length > 100 ? '...' : ''}</p>
              ` : ''}
              ${subrace.abilityBonuses ? html`
                <div class="details">
                  ${Object.entries(subrace.abilityBonuses)
                    .filter(([, value]) => value !== 0)
                    .map(([ability, bonus]) =>
                      html`<span class="tag">${ability.slice(0, 3).toUpperCase()} +${bonus}</span>`
                    )}
                </div>
              ` : ''}
            </div>
          `)}
        </div>

        ${selectedSubrace ? this.renderSubraceDetails(selectedSubrace) : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'subrace-step': SubraceStep;
  }
}
