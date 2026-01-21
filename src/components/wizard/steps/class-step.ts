import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { stepStyles } from '../step-styles.ts';
import type { WizardFormState, StepValidationResult } from '../wizard-types.ts';
import type { ClassSelection } from '../../../types/character.ts';
import type { ModuleClass } from '../../../types/module.ts';
import { packLoader } from '../../../services/pack-loader.ts';

@customElement('class-step')
export class ClassStep extends LitElement {
  static styles = [stepStyles, css`
    .class-details {
      margin-top: var(--spacing-lg);
      padding: var(--spacing-lg);
      background: var(--color-surface);
      border-radius: var(--radius-md);
    }

    .class-details h3 {
      margin: 0 0 var(--spacing-md);
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
      min-width: 80px;
    }

    .stat-item .label {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    .stat-item .value {
      font-size: var(--font-size-lg);
      font-weight: 600;
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

    .proficiency-list {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-xs);
      margin-top: var(--spacing-sm);
    }

    .proficiency-item {
      background: var(--color-background);
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      font-size: var(--font-size-sm);
    }

    .spellcasting-badge {
      background: var(--color-primary);
      color: white;
      padding: 2px 8px;
      border-radius: var(--radius-sm);
      font-size: 11px;
      margin-left: var(--spacing-sm);
    }
  `];

  @property({ type: Object }) formState!: WizardFormState;
  @state() private classes: ModuleClass[] = [];

  connectedCallback() {
    super.connectedCallback();
    this.classes = packLoader.getAllClasses();
  }

  private dispatchUpdate(classSelection: ClassSelection | null) {
    this.dispatchEvent(new CustomEvent('selection-update', {
      detail: { class: classSelection },
      bubbles: true,
      composed: true,
    }));
  }

  static validate(formState: WizardFormState): StepValidationResult {
    const errors: string[] = [];
    const { character } = formState;

    if (!character.selections.class) {
      errors.push('Please select a class');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private handleClassSelect(classId: string) {
    this.dispatchUpdate({
      classId,
      subclassId: undefined,
      subclassLevel: undefined,
    });
  }

  private getSelectedClass(): ModuleClass | undefined {
    const classId = this.formState.character.selections.class?.classId;
    return this.classes.find(c => c.id === classId);
  }

  private renderClassDetails(cls: ModuleClass) {
    const level = this.formState.character.level;
    const features = cls.features.filter(f => f.level <= level);

    return html`
      <div class="class-details">
        <h3>
          ${cls.name}
          ${cls.spellcasting ? html`<span class="spellcasting-badge">Spellcaster</span>` : ''}
        </h3>
        <p>${cls.description}</p>

        <div class="stat-row">
          <div class="stat-item">
            <span class="label">Hit Die</span>
            <span class="value">d${cls.hitDie}</span>
          </div>
          <div class="stat-item">
            <span class="label">Primary</span>
            <span class="value">${cls.primaryAbility.map(a => a.slice(0, 3).toUpperCase()).join('/')}</span>
          </div>
          <div class="stat-item">
            <span class="label">Saves</span>
            <span class="value">${cls.savingThrows.map(s => s.slice(0, 3).toUpperCase()).join(', ')}</span>
          </div>
        </div>

        ${cls.proficiencies ? html`
          <h4 class="section-title">Proficiencies</h4>
          <div class="proficiency-list">
            ${cls.proficiencies.armor?.map(a => html`<span class="proficiency-item">${a}</span>`)}
            ${cls.proficiencies.weapons?.map(w => html`<span class="proficiency-item">${w}</span>`)}
            ${cls.proficiencies.tools?.map(t => html`<span class="proficiency-item">${t}</span>`)}
          </div>
        ` : ''}

        <h4 class="section-title">Skill Choices</h4>
        <p>Choose ${cls.skillChoices.count} from: ${cls.skillChoices.options.join(', ')}</p>

        ${features.length > 0 ? html`
          <h4 class="section-title">Features at Level ${level}</h4>
          <ul class="feature-list">
            ${features.map(feature => html`
              <li class="feature-item">
                <span class="level">Lv ${feature.level}</span>
                <strong>${feature.name}</strong>
                <p>${feature.description.slice(0, 150)}${feature.description.length > 150 ? '...' : ''}</p>
              </li>
            `)}
          </ul>
        ` : ''}

        ${cls.subclassLevel && level >= cls.subclassLevel ? html`
          <div class="info-box info">
            <p>At level ${cls.subclassLevel}, you can choose a ${cls.subclassTitle || 'subclass'}.</p>
          </div>
        ` : cls.subclassLevel ? html`
          <div class="info-box">
            <p>You'll choose a ${cls.subclassTitle || 'subclass'} at level ${cls.subclassLevel}.</p>
          </div>
        ` : ''}

        ${cls.spellcasting ? html`
          <h4 class="section-title">Spellcasting</h4>
          <p>
            Spellcasting ability: <strong>${cls.spellcasting.ability}</strong><br>
            Type: ${cls.spellcasting.type} caster
            ${cls.spellcasting.ritual ? ' (can cast rituals)' : ''}
          </p>
        ` : ''}
      </div>
    `;
  }

  render() {
    const selectedClass = this.getSelectedClass();

    return html`
      <div class="step-container">
        <h2 class="step-title">Choose Your Class</h2>
        <p class="step-description">Your class determines your abilities, combat style, and how you interact with the world.</p>

        ${this.classes.length > 0 ? html`
          <div class="option-grid">
            ${this.classes.map(cls => html`
              <div
                class="option-card ${this.formState.character.selections.class?.classId === cls.id ? 'selected' : ''}"
                @click=${() => this.handleClassSelect(cls.id)}
              >
                <h4>
                  ${cls.name}
                  ${cls.spellcasting ? html`<span class="spellcasting-badge">Magic</span>` : ''}
                </h4>
                <p>${cls.description.slice(0, 80)}${cls.description.length > 80 ? '...' : ''}</p>
                <div class="details">
                  <span class="tag">d${cls.hitDie} Hit Die</span>
                  <span class="tag">${cls.primaryAbility[0]?.slice(0, 3).toUpperCase()}</span>
                </div>
              </div>
            `)}
          </div>

          ${selectedClass ? this.renderClassDetails(selectedClass) : ''}
        ` : html`
          <div class="empty-state">
            <p>No classes available.</p>
            <p>Please enable module packs in the options menu.</p>
          </div>
        `}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'class-step': ClassStep;
  }
}
