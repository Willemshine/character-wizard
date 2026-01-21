import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { stepStyles } from '../step-styles.ts';
import type { WizardFormState, StepValidationResult } from '../wizard-types.ts';
import type { CharacterState, Edition } from '../../../types/character.ts';

@customElement('basic-info-step')
export class BasicInfoStep extends LitElement {
  static styles = [stepStyles, css`
    .edition-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-lg);
    }

    @media (max-width: 600px) {
      .edition-cards {
        grid-template-columns: 1fr;
      }
    }

    .level-input {
      width: 80px !important;
      text-align: center;
    }
  `];

  @property({ type: Object }) formState!: WizardFormState;

  private dispatchUpdate(updates: Partial<CharacterState>) {
    this.dispatchEvent(new CustomEvent('character-update', {
      detail: updates,
      bubbles: true,
      composed: true,
    }));
  }

  static validate(formState: WizardFormState): StepValidationResult {
    const errors: string[] = [];
    const { character } = formState;

    if (!character.name || character.name.trim().length === 0) {
      errors.push('Character name is required');
    }

    if (character.level < 1 || character.level > 20) {
      errors.push('Level must be between 1 and 20');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private handleNameChange(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    this.dispatchUpdate({ name: value });
  }

  private handlePlayerNameChange(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    this.dispatchUpdate({ playerName: value || undefined });
  }

  private handleLevelChange(e: Event) {
    const value = parseInt((e.target as HTMLInputElement).value) || 1;
    const level = Math.max(1, Math.min(20, value));
    this.dispatchUpdate({ level });
  }

  private handleEditionSelect(edition: Edition) {
    this.dispatchUpdate({ edition });
  }

  render() {
    const { character } = this.formState;
    const validation = BasicInfoStep.validate(this.formState);

    return html`
      <div class="step-container">
        <h2 class="step-title">Basic Information</h2>
        <p class="step-description">Enter your character's basic details to get started.</p>

        <div class="form-group">
          <label for="edition">Game Edition</label>
          <div class="edition-cards">
            <div
              class="option-card ${character.edition === '5e' ? 'selected' : ''}"
              @click=${() => this.handleEditionSelect('5e')}
            >
              <h4>D&D 5e</h4>
              <p>Original 5th Edition rules (2014)</p>
            </div>
            <div
              class="option-card ${character.edition === '5e-2024' ? 'selected' : ''}"
              @click=${() => this.handleEditionSelect('5e-2024')}
            >
              <h4>D&D 5e (2024)</h4>
              <p>Updated 2024 core rulebooks</p>
            </div>
            <div
              class="option-card ${character.edition === 'custom' ? 'selected' : ''}"
              @click=${() => this.handleEditionSelect('custom')}
            >
              <h4>Custom</h4>
              <p>Homebrew or mixed content</p>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="name" class="required">Character Name</label>
            <input
              type="text"
              id="name"
              .value=${character.name}
              @input=${this.handleNameChange}
              placeholder="Enter character name"
              class="${!character.name ? 'error' : ''}"
            />
            ${!character.name && validation.errors.includes('Character name is required')
              ? html`<div class="error-message">Character name is required</div>`
              : ''}
          </div>

          <div class="form-group">
            <label for="playerName">Player Name</label>
            <input
              type="text"
              id="playerName"
              .value=${character.playerName || ''}
              @input=${this.handlePlayerNameChange}
              placeholder="Your name (optional)"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="level" class="required">Starting Level</label>
          <input
            type="number"
            id="level"
            class="level-input"
            min="1"
            max="20"
            .value=${String(character.level)}
            @input=${this.handleLevelChange}
          />
          <div class="hint">Most campaigns start at level 1. Higher levels unlock more features.</div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'basic-info-step': BasicInfoStep;
  }
}
