import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { stepStyles } from '../step-styles.ts';
import type { WizardFormState, StepValidationResult } from '../wizard-types.ts';
import type { BackgroundSelection } from '../../../types/character.ts';
import type { ModuleBackground } from '../../../types/module.ts';
import { packLoader } from '../../../services/pack-loader.ts';

@customElement('background-step')
export class BackgroundStep extends LitElement {
  static styles = [stepStyles, css`
    .background-details {
      margin-top: var(--spacing-lg);
      padding: var(--spacing-lg);
      background: var(--color-surface);
      border-radius: var(--radius-md);
    }

    .background-details h3 {
      margin: 0 0 var(--spacing-md);
    }

    .proficiency-list {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-xs);
      margin: var(--spacing-sm) 0;
    }

    .proficiency-item {
      background: var(--color-background);
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      font-size: var(--font-size-sm);
    }

    .equipment-list {
      list-style: disc;
      padding-left: var(--spacing-lg);
      margin: var(--spacing-sm) 0;
    }

    .feature-box {
      background: var(--color-background);
      border-radius: var(--radius-md);
      padding: var(--spacing-md);
      margin-top: var(--spacing-md);
    }

    .feature-box h4 {
      margin: 0 0 var(--spacing-sm);
      color: var(--color-primary);
    }

    .characteristics-section {
      margin-top: var(--spacing-lg);
    }

    .characteristics-list {
      list-style: decimal;
      padding-left: var(--spacing-lg);
      margin: var(--spacing-sm) 0;
    }

    .characteristics-list li {
      margin-bottom: var(--spacing-xs);
      font-size: var(--font-size-sm);
    }
  `];

  @property({ type: Object }) formState!: WizardFormState;
  @state() private backgrounds: ModuleBackground[] = [];

  connectedCallback() {
    super.connectedCallback();
    this.backgrounds = packLoader.getAllBackgrounds();
  }

  private dispatchUpdate(background: BackgroundSelection | null) {
    this.dispatchEvent(new CustomEvent('selection-update', {
      detail: { background },
      bubbles: true,
      composed: true,
    }));
  }

  static validate(formState: WizardFormState): StepValidationResult {
    const errors: string[] = [];
    const { character } = formState;

    if (!character.selections.background) {
      errors.push('Please select a background');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private handleBackgroundSelect(backgroundId: string) {
    this.dispatchUpdate({
      backgroundId,
      customizations: {
        personalityTraits: [],
        ideals: [],
        bonds: [],
        flaws: [],
      },
    });
  }

  private getSelectedBackground(): ModuleBackground | undefined {
    const backgroundId = this.formState.character.selections.background?.backgroundId;
    return this.backgrounds.find(b => b.id === backgroundId);
  }

  private renderBackgroundDetails(bg: ModuleBackground) {
    return html`
      <div class="background-details">
        <h3>${bg.name}</h3>
        <p>${bg.description}</p>

        <h4 class="section-title">Skill Proficiencies</h4>
        <div class="proficiency-list">
          ${bg.skillProficiencies.map(skill => html`
            <span class="proficiency-item">${skill}</span>
          `)}
        </div>

        ${bg.toolProficiencies && bg.toolProficiencies.length > 0 ? html`
          <h4 class="section-title">Tool Proficiencies</h4>
          <div class="proficiency-list">
            ${bg.toolProficiencies.map(tool => html`
              <span class="proficiency-item">${tool}</span>
            `)}
          </div>
        ` : ''}

        ${bg.languages ? html`
          <h4 class="section-title">Languages</h4>
          <p>${bg.languages} additional language${bg.languages > 1 ? 's' : ''} of your choice</p>
        ` : ''}

        <h4 class="section-title">Equipment</h4>
        <ul class="equipment-list">
          ${bg.equipment.map(item => html`<li>${item}</li>`)}
        </ul>

        <div class="feature-box">
          <h4>${bg.feature.name}</h4>
          <p>${bg.feature.description}</p>
        </div>

        ${bg.suggestedCharacteristics ? html`
          <div class="characteristics-section">
            ${bg.suggestedCharacteristics.personalityTraits?.length ? html`
              <h4 class="section-title">Suggested Personality Traits</h4>
              <ol class="characteristics-list">
                ${bg.suggestedCharacteristics.personalityTraits.slice(0, 4).map(trait =>
                  html`<li>${trait}</li>`
                )}
              </ol>
            ` : ''}

            ${bg.suggestedCharacteristics.ideals?.length ? html`
              <h4 class="section-title">Suggested Ideals</h4>
              <ol class="characteristics-list">
                ${bg.suggestedCharacteristics.ideals.slice(0, 4).map(ideal =>
                  html`<li>${ideal}</li>`
                )}
              </ol>
            ` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }

  render() {
    const selectedBackground = this.getSelectedBackground();

    return html`
      <div class="step-container">
        <h2 class="step-title">Choose Your Background</h2>
        <p class="step-description">
          Your background describes where you came from, your original occupation, and your place in the world.
        </p>

        ${this.backgrounds.length > 0 ? html`
          <div class="option-grid">
            ${this.backgrounds.map(bg => html`
              <div
                class="option-card ${this.formState.character.selections.background?.backgroundId === bg.id ? 'selected' : ''}"
                @click=${() => this.handleBackgroundSelect(bg.id)}
              >
                <h4>${bg.name}</h4>
                <p>${bg.description.slice(0, 80)}${bg.description.length > 80 ? '...' : ''}</p>
                <div class="details">
                  ${bg.skillProficiencies.slice(0, 2).map(skill =>
                    html`<span class="tag">${skill}</span>`
                  )}
                </div>
              </div>
            `)}
          </div>

          ${selectedBackground ? this.renderBackgroundDetails(selectedBackground) : ''}
        ` : html`
          <div class="empty-state">
            <p>No backgrounds available.</p>
            <p>Please enable module packs in the options menu.</p>
          </div>
        `}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'background-step': BackgroundStep;
  }
}
