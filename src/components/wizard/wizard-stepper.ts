import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import type { WizardStepConfig, WizardFormState } from './wizard-types.ts';

@customElement('wizard-stepper')
export class WizardStepper extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .stepper {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .stepper-track {
      display: flex;
      align-items: center;
      gap: 0;
      overflow-x: auto;
      padding: var(--spacing-sm) 0;
    }

    .step {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }

    .step-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .step-indicator:hover:not(.disabled) {
      opacity: 0.8;
    }

    .step-indicator.disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .step-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--font-size-sm);
      font-weight: 600;
      border: 2px solid var(--color-border);
      background: var(--color-background);
      color: var(--color-text-secondary);
      transition: all 0.2s;
    }

    .step-circle.active {
      border-color: var(--color-primary);
      background: var(--color-primary);
      color: white;
    }

    .step-circle.completed {
      border-color: var(--color-success);
      background: var(--color-success);
      color: white;
    }

    .step-circle.error {
      border-color: var(--color-danger);
      background: var(--color-danger);
      color: white;
    }

    .step-circle.visited:not(.active):not(.completed) {
      border-color: var(--color-primary-light);
    }

    .step-label {
      margin-top: var(--spacing-xs);
      font-size: 10px;
      color: var(--color-text-secondary);
      text-align: center;
      max-width: 60px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .step-label.active {
      color: var(--color-primary);
      font-weight: 600;
    }

    .step-connector {
      flex: 0 0 24px;
      height: 2px;
      background: var(--color-border);
      margin: 0 var(--spacing-xs);
      margin-bottom: 20px;
      transition: background-color 0.2s;
    }

    .step-connector.completed {
      background: var(--color-success);
    }

    /* Responsive: show fewer labels on small screens */
    @media (max-width: 768px) {
      .step-label {
        display: none;
      }

      .step-label.active {
        display: block;
      }

      .step-connector {
        flex: 0 0 16px;
        margin: 0 2px;
        margin-bottom: 0;
      }

      .step-circle {
        width: 28px;
        height: 28px;
        font-size: 12px;
      }
    }

    /* Progress text below stepper */
    .progress-text {
      text-align: center;
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin-top: var(--spacing-sm);
    }

    .progress-text strong {
      color: var(--color-text-primary);
    }

    /* Checkmark icon for completed steps */
    .checkmark {
      width: 14px;
      height: 14px;
    }
  `;

  @property({ type: Array }) steps: WizardStepConfig[] = [];
  @property({ type: Number }) currentStep = 0;
  @property({ type: Object }) formState: WizardFormState | null = null;
  @property({ type: Boolean }) allowNavigation = true;

  private handleStepClick(index: number) {
    if (!this.allowNavigation) return;

    // Only allow navigation to visited steps or the next unvisited step
    const canNavigate = this.formState?.visitedSteps.has(index) ||
      index === this.currentStep + 1;

    if (canNavigate || index <= this.currentStep) {
      this.dispatchEvent(new CustomEvent('step-click', {
        detail: { step: index },
        bubbles: true,
        composed: true,
      }));
    }
  }

  private isStepCompleted(index: number): boolean {
    return this.formState?.completedSteps.has(index) ?? false;
  }

  private isStepVisited(index: number): boolean {
    return this.formState?.visitedSteps.has(index) ?? false;
  }

  private hasStepError(index: number): boolean {
    const stepId = this.steps[index]?.id;
    const errors = this.formState?.stepErrors[stepId];
    return errors !== undefined && errors.length > 0;
  }

  private getVisibleSteps(): { step: WizardStepConfig; originalIndex: number }[] {
    return this.steps
      .map((step, index) => ({ step, originalIndex: index }))
      .filter(({ step }) => {
        if (!step.isVisible) return true;
        return this.formState ? step.isVisible(this.formState) : true;
      });
  }

  private renderStepCircle(index: number, visibleIndex: number) {
    const isActive = index === this.currentStep;
    const isCompleted = this.isStepCompleted(index);
    const isVisited = this.isStepVisited(index);
    const hasError = this.hasStepError(index);

    const classes = {
      'step-circle': true,
      active: isActive,
      completed: isCompleted && !isActive,
      visited: isVisited,
      error: hasError && !isActive,
    };

    if (isCompleted && !isActive) {
      return html`
        <div class=${classMap(classes)}>
          <svg class="checkmark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      `;
    }

    return html`<div class=${classMap(classes)}>${visibleIndex + 1}</div>`;
  }

  render() {
    const visibleSteps = this.getVisibleSteps();
    const currentVisibleIndex = visibleSteps.findIndex(s => s.originalIndex === this.currentStep);

    return html`
      <div class="stepper">
        <div class="stepper-track">
          ${visibleSteps.map(({ step, originalIndex }, visibleIndex) => {
            const isLast = visibleIndex === visibleSteps.length - 1;
            const isActive = originalIndex === this.currentStep;
            const canClick = this.allowNavigation &&
              (this.isStepVisited(originalIndex) || originalIndex <= this.currentStep + 1);

            return html`
              <div class="step">
                <div
                  class="step-indicator ${canClick ? '' : 'disabled'}"
                  @click=${() => this.handleStepClick(originalIndex)}
                  title=${step.title}
                >
                  ${this.renderStepCircle(originalIndex, visibleIndex)}
                  <span class="step-label ${isActive ? 'active' : ''}">${step.shortTitle}</span>
                </div>
                ${!isLast ? html`
                  <div class="step-connector ${this.isStepCompleted(originalIndex) ? 'completed' : ''}"></div>
                ` : ''}
              </div>
            `;
          })}
        </div>
        <div class="progress-text">
          Step <strong>${currentVisibleIndex + 1}</strong> of <strong>${visibleSteps.length}</strong>:
          ${visibleSteps[currentVisibleIndex]?.step.title ?? ''}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wizard-stepper': WizardStepper;
  }
}
