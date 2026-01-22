import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { stepStyles } from '../step-styles.ts';
import type { WizardFormState, StepValidationResult } from '../wizard-types.ts';
import type { TraitChoice } from '../../../types/character.ts';
import type { ModuleClass, ModuleClassFeature, FeatureChoice } from '../../../types/module.ts';
import { packLoader } from '../../../services/pack-loader.ts';

interface FeatureWithSource {
  feature: ModuleClassFeature;
  source: string;
  sourceType: 'class' | 'subclass' | 'race';
}

@customElement('features-step')
export class FeaturesStep extends LitElement {
  static styles = [stepStyles, css`
    .features-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .feature-card {
      background: var(--color-surface);
      border-radius: var(--radius-md);
      padding: var(--spacing-lg);
      border-left: 4px solid var(--color-primary);
    }

    .feature-card.race {
      border-left-color: var(--color-success);
    }

    .feature-card.subclass {
      border-left-color: var(--color-warning);
    }

    .feature-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--spacing-sm);
    }

    .feature-header h3 {
      margin: 0;
    }

    .feature-source {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      background: var(--color-background);
      padding: 2px 8px;
      border-radius: var(--radius-sm);
    }

    .feature-level {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    .feature-description {
      margin: var(--spacing-md) 0;
      line-height: 1.6;
    }

    .feature-choices {
      margin-top: var(--spacing-md);
      padding-top: var(--spacing-md);
      border-top: 1px solid var(--color-border);
    }

    .feature-choices h4 {
      margin: 0 0 var(--spacing-sm);
      font-size: var(--font-size-md);
    }

    .choice-count {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin-bottom: var(--spacing-sm);
    }

    .choice-options {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: var(--spacing-sm);
    }

    .choice-option {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm);
      background: var(--color-background);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .choice-option:hover {
      background: rgba(92, 107, 192, 0.1);
    }

    .choice-option input {
      width: 18px;
      height: 18px;
    }

    .no-choices {
      text-align: center;
      padding: var(--spacing-xl);
      color: var(--color-text-secondary);
    }
  `];

  @property({ type: Object }) formState!: WizardFormState;
  @state() private selectedClass: ModuleClass | null = null;
  @state() private featuresWithChoices: FeatureWithSource[] = [];

  connectedCallback() {
    super.connectedCallback();
    this.loadData();
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('formState')) {
      this.loadData();
    }
  }

  private loadData() {
    const classId = this.formState.character.selections.class?.classId;
    const level = this.formState.character.level;

    this.featuresWithChoices = [];

    if (classId) {
      const classes = packLoader.getAllClasses();
      this.selectedClass = classes.find(c => c.id === classId) ?? null;

      if (this.selectedClass) {
        // Get class features at current level with choices
        const classFeatures = this.selectedClass.features
          .filter(f => f.level <= level && f.choices && f.choices.length > 0)
          .map(f => ({
            feature: f,
            source: this.selectedClass!.name,
            sourceType: 'class' as const,
          }));
        this.featuresWithChoices.push(...classFeatures);

        // Get subclass features
        const subclassId = this.formState.character.selections.class?.subclassId;
        if (subclassId) {
          const subclasses = packLoader.getSubclassesForClass(classId);
          const subclass = subclasses.find(s => s.id === subclassId);
          if (subclass) {
            const subclassFeatures = subclass.features
              .filter(f => f.level <= level && f.choices && f.choices.length > 0)
              .map(f => ({
                feature: f,
                source: subclass.name,
                sourceType: 'subclass' as const,
              }));
            this.featuresWithChoices.push(...subclassFeatures);
          }
        }
      }
    }

    // Note: Race traits with choices could be added here in the future
  }

  private dispatchUpdate(traitChoices: TraitChoice[]) {
    this.dispatchEvent(new CustomEvent('selection-update', {
      detail: { traitChoices },
      bubbles: true,
      composed: true,
    }));
  }

  static validate(_formState: WizardFormState): StepValidationResult {
    const errors: string[] = [];

    // Features step is generally optional
    // Could add validation for required choices

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private getTraitChoice(featureId: string, choiceId: string): TraitChoice | undefined {
    return this.formState.character.selections.traitChoices.find(
      tc => tc.featureId === featureId && tc.choiceId === choiceId
    );
  }

  private handleChoiceSelect(featureId: string, choice: FeatureChoice, option: string) {
    const current = this.formState.character.selections.traitChoices;
    const existingIndex = current.findIndex(
      tc => tc.featureId === featureId && tc.choiceId === choice.id
    );

    let newChoices: TraitChoice[];

    if (existingIndex >= 0) {
      const existing = current[existingIndex];
      const isSelected = existing.selectedOptions.includes(option);

      if (isSelected) {
        // Remove option
        const newOptions = existing.selectedOptions.filter(o => o !== option);
        if (newOptions.length === 0) {
          // Remove entire choice
          newChoices = current.filter((_, i) => i !== existingIndex);
        } else {
          newChoices = current.map((tc, i) =>
            i === existingIndex ? { ...tc, selectedOptions: newOptions } : tc
          );
        }
      } else {
        // Add option (respecting count limit)
        const newOptions = [...existing.selectedOptions, option].slice(0, choice.count);
        newChoices = current.map((tc, i) =>
          i === existingIndex ? { ...tc, selectedOptions: newOptions } : tc
        );
      }
    } else {
      // Create new choice
      newChoices = [...current, {
        featureId,
        choiceId: choice.id,
        selectedOptions: [option],
      }];
    }

    this.dispatchUpdate(newChoices);
  }

  private renderFeatureChoice(featureId: string, choice: FeatureChoice) {
    const traitChoice = this.getTraitChoice(featureId, choice.id);
    const selectedOptions = traitChoice?.selectedOptions ?? [];

    return html`
      <div class="feature-choices">
        <h4>${choice.description || `Choose ${choice.count}`}</h4>
        <div class="choice-count">
          ${selectedOptions.length}/${choice.count} selected
        </div>
        <div class="choice-options">
          ${choice.options.map(option => {
            const isSelected = selectedOptions.includes(option);
            const canSelect = isSelected || selectedOptions.length < choice.count;

            return html`
              <label class="choice-option">
                <input
                  type="checkbox"
                  .checked=${isSelected}
                  ?disabled=${!canSelect && !isSelected}
                  @change=${() => this.handleChoiceSelect(featureId, choice, option)}
                />
                <span>${option}</span>
              </label>
            `;
          })}
        </div>
      </div>
    `;
  }

  private renderFeatureCard(item: FeatureWithSource) {
    const { feature, source, sourceType } = item;

    return html`
      <div class="feature-card ${sourceType}">
        <div class="feature-header">
          <div>
            <h3>${feature.name}</h3>
            <span class="feature-level">Level ${feature.level}</span>
          </div>
          <span class="feature-source">${source}</span>
        </div>
        <div class="feature-description">
          ${feature.description}
        </div>
        ${feature.choices?.map(choice => this.renderFeatureChoice(feature.id, choice))}
      </div>
    `;
  }

  render() {
    return html`
      <div class="step-container">
        <h2 class="step-title">Features & Traits</h2>
        <p class="step-description">
          Make choices for your class and race features.
        </p>

        ${this.featuresWithChoices.length > 0 ? html`
          <div class="features-list">
            ${this.featuresWithChoices.map(item => this.renderFeatureCard(item))}
          </div>
        ` : html`
          <div class="no-choices">
            <p>No feature choices available at level ${this.formState.character.level}.</p>
            <p>Your features will be automatically applied based on your class and race selections.</p>
          </div>
        `}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'features-step': FeaturesStep;
  }
}
