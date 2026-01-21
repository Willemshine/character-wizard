import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { store } from '../store/store.ts';
import { router } from '../router/router.ts';
import { persistence } from '../services/persistence.ts';
import {
  createEmptyCharacterState,
  type CharacterState,
  type CharacterSelections,
  recalculateDerivedStats,
} from '../types/character.ts';
import {
  WIZARD_STEPS,
  type WizardFormState,
  type WizardStepConfig,
  createInitialFormState,
} from '../components/wizard/wizard-types.ts';

// Import UI components
import '../components/ui/cw-button.ts';
import '../components/ui/cw-card.ts';

// Import wizard components
import '../components/wizard/wizard-stepper.ts';
import '../components/wizard/steps/basic-info-step.ts';
import '../components/wizard/steps/race-step.ts';
import '../components/wizard/steps/subrace-step.ts';
import '../components/wizard/steps/class-step.ts';
import '../components/wizard/steps/subclass-step.ts';
import '../components/wizard/steps/background-step.ts';
import '../components/wizard/steps/ability-scores-step.ts';
import '../components/wizard/steps/skills-step.ts';
import '../components/wizard/steps/equipment-step.ts';
import '../components/wizard/steps/spells-step.ts';
import '../components/wizard/steps/features-step.ts';
import '../components/wizard/steps/review-step.ts';

// Import step validation functions
import { BasicInfoStep } from '../components/wizard/steps/basic-info-step.ts';
import { RaceStep } from '../components/wizard/steps/race-step.ts';
import { SubraceStep } from '../components/wizard/steps/subrace-step.ts';
import { ClassStep } from '../components/wizard/steps/class-step.ts';
import { SubclassStep } from '../components/wizard/steps/subclass-step.ts';
import { BackgroundStep } from '../components/wizard/steps/background-step.ts';
import { AbilityScoresStep } from '../components/wizard/steps/ability-scores-step.ts';
import { SkillsStep } from '../components/wizard/steps/skills-step.ts';
import { EquipmentStep } from '../components/wizard/steps/equipment-step.ts';
import { SpellsStep } from '../components/wizard/steps/spells-step.ts';
import { FeaturesStep } from '../components/wizard/steps/features-step.ts';
import { ReviewStep } from '../components/wizard/steps/review-step.ts';

const APP_VERSION = '1.0.0';

// Map step IDs to their validation functions
const STEP_VALIDATORS: Record<string, (formState: WizardFormState) => { isValid: boolean; errors: string[] }> = {
  'basic-info': BasicInfoStep.validate,
  'race': RaceStep.validate,
  'subrace': SubraceStep.validate,
  'class': ClassStep.validate,
  'subclass': SubclassStep.validate,
  'background': BackgroundStep.validate,
  'ability-scores': AbilityScoresStep.validate,
  'skills': SkillsStep.validate,
  'equipment': EquipmentStep.validate,
  'spells': SpellsStep.validate,
  'features': FeaturesStep.validate,
  'review': ReviewStep.validate,
};

// Map step IDs to their visibility functions
const STEP_VISIBILITY: Record<string, (formState: WizardFormState) => boolean> = {
  'subrace': SubraceStep.shouldShow,
  'subclass': SubclassStep.shouldShow,
  'spells': SpellsStep.shouldShow,
};

@customElement('wizard-page')
export class WizardPage extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: var(--spacing-lg);
      max-width: 1000px;
      margin: 0 auto;
    }

    .wizard-header {
      margin-bottom: var(--spacing-xl);
    }

    .wizard-header h1 {
      margin: 0 0 var(--spacing-md);
      font-size: var(--font-size-xxl);
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
      gap: var(--spacing-md);
    }

    .wizard-actions .left,
    .wizard-actions .right {
      display: flex;
      gap: var(--spacing-md);
    }

    .skip-link {
      color: var(--color-text-secondary);
      text-decoration: underline;
      cursor: pointer;
      font-size: var(--font-size-sm);
      background: none;
      border: none;
      padding: var(--spacing-sm);
    }

    .skip-link:hover {
      color: var(--color-primary);
    }

    @media (max-width: 600px) {
      :host {
        padding: var(--spacing-md);
      }

      .wizard-content {
        padding: var(--spacing-md);
      }

      .wizard-actions {
        flex-direction: column;
      }

      .wizard-actions .left,
      .wizard-actions .right {
        justify-content: stretch;
      }

      .wizard-actions cw-button {
        flex: 1;
      }
    }
  `;

  @state() private currentStep = 0;
  @state() private formState: WizardFormState;

  constructor() {
    super();
    const character = createEmptyCharacterState(APP_VERSION);
    this.formState = createInitialFormState(character);
  }

  connectedCallback() {
    super.connectedCallback();
    // Initialize form state
    this.formState = {
      ...this.formState,
      visitedSteps: new Set([0]),
    };
  }

  private getVisibleSteps(): { step: WizardStepConfig; originalIndex: number }[] {
    return WIZARD_STEPS
      .map((step, index) => ({ step, originalIndex: index }))
      .filter(({ step }) => {
        const visibilityFn = STEP_VISIBILITY[step.id];
        if (!visibilityFn) return true;
        return visibilityFn(this.formState);
      });
  }

  private validateCurrentStep(): boolean {
    const step = WIZARD_STEPS[this.currentStep];
    if (!step) return true;

    const validator = STEP_VALIDATORS[step.id];
    if (!validator) return true;

    const result = validator(this.formState);
    return result.isValid;
  }

  private isStepRequired(): boolean {
    const step = WIZARD_STEPS[this.currentStep];
    return step?.required ?? false;
  }

  private canProceed(): boolean {
    // For required steps, must be valid
    if (this.isStepRequired()) {
      return this.validateCurrentStep();
    }

    // For optional steps, can always proceed
    return true;
  }

  private handleStepClick(e: CustomEvent<{ step: number }>) {
    const targetStep = e.detail.step;
    this.navigateToStep(targetStep);
  }

  private navigateToStep(targetStep: number) {
    // Mark current step as visited
    const newVisitedSteps = new Set(this.formState.visitedSteps);
    newVisitedSteps.add(this.currentStep);

    // Check if current step is complete
    const newCompletedSteps = new Set(this.formState.completedSteps);
    if (this.validateCurrentStep()) {
      newCompletedSteps.add(this.currentStep);
    }

    // Mark target step as visited
    newVisitedSteps.add(targetStep);

    this.formState = {
      ...this.formState,
      visitedSteps: newVisitedSteps,
      completedSteps: newCompletedSteps,
    };

    this.currentStep = targetStep;
    store.setWizardStep(targetStep);
  }

  private handlePrevious() {
    const visibleSteps = this.getVisibleSteps();
    const currentVisibleIndex = visibleSteps.findIndex(s => s.originalIndex === this.currentStep);

    if (currentVisibleIndex > 0) {
      this.navigateToStep(visibleSteps[currentVisibleIndex - 1].originalIndex);
    }
  }

  private handleNext() {
    if (!this.canProceed()) return;

    const visibleSteps = this.getVisibleSteps();
    const currentVisibleIndex = visibleSteps.findIndex(s => s.originalIndex === this.currentStep);

    if (currentVisibleIndex < visibleSteps.length - 1) {
      this.navigateToStep(visibleSteps[currentVisibleIndex + 1].originalIndex);
    }
  }

  private handleSkip() {
    // Only for optional steps
    if (this.isStepRequired()) return;

    const visibleSteps = this.getVisibleSteps();
    const currentVisibleIndex = visibleSteps.findIndex(s => s.originalIndex === this.currentStep);

    if (currentVisibleIndex < visibleSteps.length - 1) {
      this.navigateToStep(visibleSteps[currentVisibleIndex + 1].originalIndex);
    }
  }

  private async handleFinish() {
    // Recalculate derived stats
    const updatedCharacter: CharacterState = {
      ...this.formState.character,
      updatedAt: new Date().toISOString(),
    };
    updatedCharacter.derived = recalculateDerivedStats(updatedCharacter);

    // Save character
    await persistence.saveCharacter(updatedCharacter);
    await persistence.setLastOpenedCharacter(updatedCharacter.id);

    // Update store
    store.addCharacter({
      id: updatedCharacter.id,
      name: updatedCharacter.name || 'Unnamed Character',
      race: updatedCharacter.selections.race?.raceId ?? '',
      class: updatedCharacter.selections.class?.classId ?? '',
      level: updatedCharacter.level,
      updatedAt: updatedCharacter.updatedAt,
    });

    // Navigate to character page
    router.navigate('character', { id: updatedCharacter.id });
  }

  private handleCancel() {
    router.navigate('start');
  }

  private handleCharacterUpdate(e: CustomEvent<Partial<CharacterState>>) {
    this.formState = {
      ...this.formState,
      character: {
        ...this.formState.character,
        ...e.detail,
      },
    };
  }

  private handleSelectionUpdate(e: CustomEvent<Partial<CharacterSelections>>) {
    this.formState = {
      ...this.formState,
      character: {
        ...this.formState.character,
        selections: {
          ...this.formState.character.selections,
          ...e.detail,
        },
      },
    };
  }

  private renderStepContent() {
    const step = WIZARD_STEPS[this.currentStep];
    if (!step) return html``;

    const props = {
      formState: this.formState,
    };

    switch (step.id) {
      case 'basic-info':
        return html`<basic-info-step
          .formState=${props.formState}
          @character-update=${this.handleCharacterUpdate}
        ></basic-info-step>`;

      case 'race':
        return html`<race-step
          .formState=${props.formState}
          @selection-update=${this.handleSelectionUpdate}
        ></race-step>`;

      case 'subrace':
        return html`<subrace-step
          .formState=${props.formState}
          @selection-update=${this.handleSelectionUpdate}
        ></subrace-step>`;

      case 'class':
        return html`<class-step
          .formState=${props.formState}
          @selection-update=${this.handleSelectionUpdate}
        ></class-step>`;

      case 'subclass':
        return html`<subclass-step
          .formState=${props.formState}
          @selection-update=${this.handleSelectionUpdate}
        ></subclass-step>`;

      case 'background':
        return html`<background-step
          .formState=${props.formState}
          @selection-update=${this.handleSelectionUpdate}
        ></background-step>`;

      case 'ability-scores':
        return html`<ability-scores-step
          .formState=${props.formState}
          @selection-update=${this.handleSelectionUpdate}
        ></ability-scores-step>`;

      case 'skills':
        return html`<skills-step
          .formState=${props.formState}
          @selection-update=${this.handleSelectionUpdate}
        ></skills-step>`;

      case 'equipment':
        return html`<equipment-step
          .formState=${props.formState}
          @selection-update=${this.handleSelectionUpdate}
        ></equipment-step>`;

      case 'spells':
        return html`<spells-step
          .formState=${props.formState}
          @selection-update=${this.handleSelectionUpdate}
        ></spells-step>`;

      case 'features':
        return html`<features-step
          .formState=${props.formState}
          @selection-update=${this.handleSelectionUpdate}
        ></features-step>`;

      case 'review':
        return html`<review-step
          .formState=${props.formState}
        ></review-step>`;

      default:
        return html`<p>Unknown step: ${step.id}</p>`;
    }
  }

  render() {
    const visibleSteps = this.getVisibleSteps();
    const currentVisibleIndex = visibleSteps.findIndex(s => s.originalIndex === this.currentStep);
    const isFirstStep = currentVisibleIndex === 0;
    const isLastStep = currentVisibleIndex === visibleSteps.length - 1;
    const canProceed = this.canProceed();
    const isOptionalStep = !this.isStepRequired();

    return html`
      <div class="wizard-header">
        <h1>Create Character</h1>
        <wizard-stepper
          .steps=${WIZARD_STEPS}
          .currentStep=${this.currentStep}
          .formState=${this.formState}
          @step-click=${this.handleStepClick}
        ></wizard-stepper>
      </div>

      <div class="wizard-content">
        ${this.renderStepContent()}
      </div>

      <div class="wizard-actions">
        <div class="left">
          <cw-button variant="secondary" @click=${this.handleCancel}>
            Cancel
          </cw-button>
        </div>
        <div class="right">
          ${!isFirstStep ? html`
            <cw-button variant="secondary" @click=${this.handlePrevious}>
              Previous
            </cw-button>
          ` : ''}
          ${isOptionalStep && !isLastStep ? html`
            <button class="skip-link" @click=${this.handleSkip}>
              Skip this step
            </button>
          ` : ''}
          ${!isLastStep ? html`
            <cw-button
              @click=${this.handleNext}
              ?disabled=${!canProceed}
            >
              Next
            </cw-button>
          ` : html`
            <cw-button
              @click=${this.handleFinish}
              ?disabled=${!canProceed}
            >
              Create Character
            </cw-button>
          `}
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
