import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { stepStyles } from '../step-styles.ts';
import type { WizardFormState, StepValidationResult } from '../wizard-types.ts';
import type { ModuleSubclass, ModuleClass } from '../../../types/module.ts';
import { packLoader } from '../../../services/pack-loader.ts';

@customElement('subclass-step')
export class SubclassStep extends LitElement {
  static styles = [stepStyles, css`
    .subclass-details {
      margin-top: var(--spacing-lg);
      padding: var(--spacing-lg);
      background: var(--color-surface);
      border-radius: var(--radius-md);
    }

    .feature-list {
      list-style: none;
      padding: 0;
      margin: var(--spacing-sm) 0;
    }

    .feature-item {
      padding: var(--spacing-sm) 0;
      border-bottom: 1px solid var(--color-border);
    }

    .feature-item:last-child {
      border-bottom: none;
    }

    .feature-item .level {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin-right: var(--spacing-sm);
    }
  `];

  @property({ type: Object }) formState!: WizardFormState;
  @state() private subclasses: ModuleSubclass[] = [];
  @state() private parentClass: ModuleClass | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.loadSubclasses();
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('formState')) {
      this.loadSubclasses();
    }
  }

  private loadSubclasses() {
    const classId = this.formState.character.selections.class?.classId;
    if (classId) {
      this.subclasses = packLoader.getSubclassesForClass(classId);
      const classes = packLoader.getAllClasses();
      this.parentClass = classes.find(c => c.id === classId) ?? null;
    } else {
      this.subclasses = [];
      this.parentClass = null;
    }
  }

  private dispatchUpdate(subclassId: string | undefined) {
    const currentClass = this.formState.character.selections.class;
    if (!currentClass) return;

    this.dispatchEvent(new CustomEvent('selection-update', {
      detail: {
        class: {
          ...currentClass,
          subclassId,
          subclassLevel: this.parentClass?.subclassLevel,
        },
      },
      bubbles: true,
      composed: true,
    }));
  }

  static validate(formState: WizardFormState): StepValidationResult {
    const errors: string[] = [];
    const { character } = formState;

    const classId = character.selections.class?.classId;
    if (classId) {
      const classes = packLoader.getAllClasses();
      const parentClass = classes.find(c => c.id === classId);

      if (parentClass?.subclassLevel && character.level >= parentClass.subclassLevel) {
        const subclasses = packLoader.getSubclassesForClass(classId);
        if (subclasses.length > 0 && !character.selections.class?.subclassId) {
          errors.push('Please select a subclass');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static shouldShow(formState: WizardFormState): boolean {
    const classId = formState.character.selections.class?.classId;
    if (!classId) return false;

    const classes = packLoader.getAllClasses();
    const parentClass = classes.find(c => c.id === classId);

    if (!parentClass?.subclassLevel) return false;
    if (formState.character.level < parentClass.subclassLevel) return false;

    const subclasses = packLoader.getSubclassesForClass(classId);
    return subclasses.length > 0;
  }

  private handleSubclassSelect(subclassId: string) {
    this.dispatchUpdate(subclassId);
  }

  private getSelectedSubclass(): ModuleSubclass | undefined {
    const subclassId = this.formState.character.selections.class?.subclassId;
    return this.subclasses.find(s => s.id === subclassId);
  }

  private renderSubclassDetails(subclass: ModuleSubclass) {
    const level = this.formState.character.level;
    const features = subclass.features.filter(f => f.level <= level);

    return html`
      <div class="subclass-details">
        <h3>${subclass.name}</h3>
        ${subclass.description ? html`<p>${subclass.description}</p>` : ''}

        ${features.length > 0 ? html`
          <h4 class="section-title">Features at Level ${level}</h4>
          <ul class="feature-list">
            ${features.map(feature => html`
              <li class="feature-item">
                <span class="level">Lv ${feature.level}</span>
                <strong>${feature.name}</strong>
                <p>${feature.description.slice(0, 200)}${feature.description.length > 200 ? '...' : ''}</p>
              </li>
            `)}
          </ul>
        ` : ''}

        ${subclass.spellcasting ? html`
          <h4 class="section-title">Spellcasting</h4>
          <p>Spellcasting ability: <strong>${subclass.spellcasting.ability}</strong></p>
        ` : ''}

        ${subclass.spellList && subclass.spellList.length > 0 ? html`
          <h4 class="section-title">Expanded Spell List</h4>
          <p>${subclass.spellList.join(', ')}</p>
        ` : ''}
      </div>
    `;
  }

  render() {
    if (!this.parentClass) {
      return html`
        <div class="step-container">
          <div class="info-box warning">
            <p>Please select a class first.</p>
          </div>
        </div>
      `;
    }

    const subclassLevel = this.parentClass.subclassLevel;
    const currentLevel = this.formState.character.level;

    if (!subclassLevel || currentLevel < subclassLevel) {
      return html`
        <div class="step-container">
          <h2 class="step-title">${this.parentClass.subclassTitle || 'Subclass'}</h2>
          <div class="info-box info">
            <p>
              ${this.parentClass.name} characters choose their ${this.parentClass.subclassTitle || 'subclass'}
              at level ${subclassLevel}.
              ${currentLevel < (subclassLevel ?? 0) ? `Your character is level ${currentLevel}.` : ''}
            </p>
            <p>You can proceed to the next step.</p>
          </div>
        </div>
      `;
    }

    if (this.subclasses.length === 0) {
      return html`
        <div class="step-container">
          <h2 class="step-title">${this.parentClass.subclassTitle || 'Subclass'}</h2>
          <div class="info-box">
            <p>No ${this.parentClass.subclassTitle || 'subclass'} options are available for ${this.parentClass.name}.</p>
            <p>You can proceed to the next step.</p>
          </div>
        </div>
      `;
    }

    const selectedSubclass = this.getSelectedSubclass();

    return html`
      <div class="step-container">
        <h2 class="step-title">Choose Your ${this.parentClass.subclassTitle || 'Subclass'}</h2>
        <p class="step-description">
          As a level ${currentLevel} ${this.parentClass.name}, you can specialize by choosing a
          ${this.parentClass.subclassTitle || 'subclass'}.
        </p>

        <div class="option-grid">
          ${this.subclasses.map(subclass => html`
            <div
              class="option-card ${this.formState.character.selections.class?.subclassId === subclass.id ? 'selected' : ''}"
              @click=${() => this.handleSubclassSelect(subclass.id)}
            >
              <h4>${subclass.name}</h4>
              ${subclass.description ? html`
                <p>${subclass.description.slice(0, 100)}${subclass.description.length > 100 ? '...' : ''}</p>
              ` : ''}
              ${subclass.spellcasting ? html`
                <div class="details">
                  <span class="tag">Spellcasting</span>
                </div>
              ` : ''}
            </div>
          `)}
        </div>

        ${selectedSubclass ? this.renderSubclassDetails(selectedSubclass) : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'subclass-step': SubclassStep;
  }
}
