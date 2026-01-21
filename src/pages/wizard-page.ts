import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { store } from '../store/store.ts';
import { router } from '../router/router.ts';
import { persistence } from '../services/persistence.ts';
import { packLoader } from '../services/pack-loader.ts';
import {
  createEmptyCharacter,
  type Character,
  type ModuleRace,
  type ModuleClass,
  type ModuleBackground,
  type Unsubscribe,
} from '../types/index.ts';
import '../components/ui/cw-button.ts';
import '../components/ui/cw-card.ts';

const WIZARD_STEPS = ['Basic Info', 'Race', 'Class', 'Background', 'Abilities', 'Review'];

@customElement('wizard-page')
export class WizardPage extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: var(--spacing-xl);
      max-width: 900px;
      margin: 0 auto;
    }

    .wizard-header {
      margin-bottom: var(--spacing-xl);
    }

    .wizard-header h1 {
      margin-bottom: var(--spacing-md);
    }

    .progress-bar {
      display: flex;
      gap: var(--spacing-xs);
      margin-bottom: var(--spacing-md);
    }

    .progress-step {
      flex: 1;
      height: 4px;
      background: var(--color-border);
      border-radius: 2px;
      transition: background-color 0.3s;
    }

    .progress-step.active {
      background: var(--color-primary);
    }

    .progress-step.completed {
      background: var(--color-success);
    }

    .step-labels {
      display: flex;
      justify-content: space-between;
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    .step-label.active {
      color: var(--color-primary);
      font-weight: 600;
    }

    .wizard-content {
      background: var(--color-surface);
      border-radius: var(--radius-md);
      padding: var(--spacing-xl);
      box-shadow: var(--shadow-sm);
      margin-bottom: var(--spacing-lg);
      min-height: 400px;
    }

    .wizard-actions {
      display: flex;
      justify-content: space-between;
    }

    .form-group {
      margin-bottom: var(--spacing-lg);
    }

    .form-group label {
      display: block;
      margin-bottom: var(--spacing-sm);
      font-weight: 500;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: var(--spacing-sm) var(--spacing-md);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      font-size: var(--font-size-md);
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px rgba(92, 107, 192, 0.2);
    }

    .option-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: var(--spacing-md);
    }

    .option-card {
      padding: var(--spacing-md);
      border: 2px solid var(--color-border);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: border-color 0.2s, background-color 0.2s;
    }

    .option-card:hover {
      border-color: var(--color-primary-light);
    }

    .option-card.selected {
      border-color: var(--color-primary);
      background-color: rgba(92, 107, 192, 0.1);
    }

    .option-card h4 {
      margin: 0 0 var(--spacing-xs);
    }

    .option-card p {
      margin: 0;
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    .ability-scores {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-md);
    }

    .ability-score {
      text-align: center;
      padding: var(--spacing-md);
      background: var(--color-background);
      border-radius: var(--radius-md);
    }

    .ability-score label {
      display: block;
      font-weight: 600;
      margin-bottom: var(--spacing-sm);
    }

    .ability-score input {
      width: 60px;
      text-align: center;
      padding: var(--spacing-sm);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      font-size: var(--font-size-lg);
    }

    .review-section {
      margin-bottom: var(--spacing-lg);
    }

    .review-section h3 {
      border-bottom: 1px solid var(--color-border);
      padding-bottom: var(--spacing-sm);
      margin-bottom: var(--spacing-md);
    }

    .review-row {
      display: flex;
      justify-content: space-between;
      padding: var(--spacing-xs) 0;
    }

    .review-label {
      color: var(--color-text-secondary);
    }
  `;

  @state() private currentStep = 0;
  @state() private character: Character = createEmptyCharacter();
  @state() private races: ModuleRace[] = [];
  @state() private classes: ModuleClass[] = [];
  @state() private backgrounds: ModuleBackground[] = [];

  private unsubscribe: Unsubscribe | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.character = createEmptyCharacter();
    this.loadData();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe?.();
  }

  private loadData() {
    this.races = packLoader.getAllRaces();
    this.classes = packLoader.getAllClasses();
    this.backgrounds = packLoader.getAllBackgrounds();
  }

  private handlePrevious() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  private handleNext() {
    if (this.currentStep < WIZARD_STEPS.length - 1) {
      this.currentStep++;
    }
  }

  private async handleFinish() {
    this.character.updatedAt = new Date().toISOString();
    await persistence.saveCharacter(this.character);
    await persistence.setLastOpenedCharacter(this.character.id);

    store.addCharacter({
      id: this.character.id,
      name: this.character.name,
      race: this.character.race,
      class: this.character.class,
      level: this.character.level,
      updatedAt: this.character.updatedAt,
    });

    router.navigate('character', { id: this.character.id });
  }

  private handleCancel() {
    router.navigate('start');
  }

  private updateCharacter(updates: Partial<Character>) {
    this.character = { ...this.character, ...updates };
  }

  private renderStepContent() {
    switch (this.currentStep) {
      case 0:
        return this.renderBasicInfo();
      case 1:
        return this.renderRaceSelection();
      case 2:
        return this.renderClassSelection();
      case 3:
        return this.renderBackgroundSelection();
      case 4:
        return this.renderAbilityScores();
      case 5:
        return this.renderReview();
      default:
        return html``;
    }
  }

  private renderBasicInfo() {
    return html`
      <h2>Basic Information</h2>
      <div class="form-group">
        <label for="name">Character Name</label>
        <input
          type="text"
          id="name"
          .value=${this.character.name}
          @input=${(e: Event) =>
            this.updateCharacter({ name: (e.target as HTMLInputElement).value })}
          placeholder="Enter character name"
        />
      </div>
      <div class="form-group">
        <label for="level">Starting Level</label>
        <input
          type="number"
          id="level"
          min="1"
          max="20"
          .value=${String(this.character.level)}
          @input=${(e: Event) =>
            this.updateCharacter({ level: parseInt((e.target as HTMLInputElement).value) || 1 })}
        />
      </div>
    `;
  }

  private renderRaceSelection() {
    return html`
      <h2>Choose Your Race</h2>
      ${this.races.length > 0
        ? html`
            <div class="option-grid">
              ${this.races.map(
                (race) => html`
                  <div
                    class="option-card ${this.character.race === race.id ? 'selected' : ''}"
                    @click=${() => this.updateCharacter({ race: race.id })}
                  >
                    <h4>${race.name}</h4>
                    <p>${race.description}</p>
                  </div>
                `
              )}
            </div>
          `
        : html`<p>No races available. Please enable module packs in options.</p>`}
    `;
  }

  private renderClassSelection() {
    return html`
      <h2>Choose Your Class</h2>
      ${this.classes.length > 0
        ? html`
            <div class="option-grid">
              ${this.classes.map(
                (cls) => html`
                  <div
                    class="option-card ${this.character.class === cls.id ? 'selected' : ''}"
                    @click=${() => this.updateCharacter({ class: cls.id })}
                  >
                    <h4>${cls.name}</h4>
                    <p>${cls.description}</p>
                  </div>
                `
              )}
            </div>
          `
        : html`<p>No classes available. Please enable module packs in options.</p>`}
    `;
  }

  private renderBackgroundSelection() {
    return html`
      <h2>Choose Your Background</h2>
      ${this.backgrounds.length > 0
        ? html`
            <div class="option-grid">
              ${this.backgrounds.map(
                (bg) => html`
                  <div
                    class="option-card ${this.character.background === bg.id ? 'selected' : ''}"
                    @click=${() => this.updateCharacter({ background: bg.id })}
                  >
                    <h4>${bg.name}</h4>
                    <p>${bg.description}</p>
                  </div>
                `
              )}
            </div>
          `
        : html`<p>No backgrounds available. Please enable module packs in options.</p>`}
    `;
  }

  private renderAbilityScores() {
    const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const;

    return html`
      <h2>Ability Scores</h2>
      <p>Assign your ability scores (standard array: 15, 14, 13, 12, 10, 8)</p>
      <div class="ability-scores">
        ${abilities.map(
          (ability) => html`
            <div class="ability-score">
              <label>${ability.charAt(0).toUpperCase() + ability.slice(1)}</label>
              <input
                type="number"
                min="1"
                max="20"
                .value=${String(this.character.abilityScores[ability])}
                @input=${(e: Event) =>
                  this.updateCharacter({
                    abilityScores: {
                      ...this.character.abilityScores,
                      [ability]: parseInt((e.target as HTMLInputElement).value) || 10,
                    },
                  })}
              />
            </div>
          `
        )}
      </div>
    `;
  }

  private renderReview() {
    const race = this.races.find((r) => r.id === this.character.race);
    const cls = this.classes.find((c) => c.id === this.character.class);
    const bg = this.backgrounds.find((b) => b.id === this.character.background);

    return html`
      <h2>Review Your Character</h2>

      <div class="review-section">
        <h3>Basic Info</h3>
        <div class="review-row">
          <span class="review-label">Name</span>
          <span>${this.character.name || 'Unnamed'}</span>
        </div>
        <div class="review-row">
          <span class="review-label">Level</span>
          <span>${this.character.level}</span>
        </div>
      </div>

      <div class="review-section">
        <h3>Character Details</h3>
        <div class="review-row">
          <span class="review-label">Race</span>
          <span>${race?.name || 'Not selected'}</span>
        </div>
        <div class="review-row">
          <span class="review-label">Class</span>
          <span>${cls?.name || 'Not selected'}</span>
        </div>
        <div class="review-row">
          <span class="review-label">Background</span>
          <span>${bg?.name || 'Not selected'}</span>
        </div>
      </div>

      <div class="review-section">
        <h3>Ability Scores</h3>
        ${Object.entries(this.character.abilityScores).map(
          ([ability, score]) => html`
            <div class="review-row">
              <span class="review-label">${ability.charAt(0).toUpperCase() + ability.slice(1)}</span>
              <span>${score}</span>
            </div>
          `
        )}
      </div>
    `;
  }

  render() {
    return html`
      <div class="wizard-header">
        <h1>Create Character</h1>
        <div class="progress-bar">
          ${WIZARD_STEPS.map(
            (_, i) => html`
              <div
                class="progress-step ${i === this.currentStep
                  ? 'active'
                  : i < this.currentStep
                  ? 'completed'
                  : ''}"
              ></div>
            `
          )}
        </div>
        <div class="step-labels">
          ${WIZARD_STEPS.map(
            (step, i) => html`
              <span class="step-label ${i === this.currentStep ? 'active' : ''}">${step}</span>
            `
          )}
        </div>
      </div>

      <div class="wizard-content">${this.renderStepContent()}</div>

      <div class="wizard-actions">
        <div>
          <cw-button variant="secondary" @click=${this.handleCancel}>Cancel</cw-button>
        </div>
        <div style="display: flex; gap: var(--spacing-md);">
          ${this.currentStep > 0
            ? html`
                <cw-button variant="secondary" @click=${this.handlePrevious}>Previous</cw-button>
              `
            : ''}
          ${this.currentStep < WIZARD_STEPS.length - 1
            ? html`<cw-button @click=${this.handleNext}>Next</cw-button>`
            : html`<cw-button @click=${this.handleFinish}>Create Character</cw-button>`}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wizard-page': WizardPage;
  }
}
