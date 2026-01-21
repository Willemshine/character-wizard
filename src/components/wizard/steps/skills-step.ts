import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { stepStyles } from '../step-styles.ts';
import type { WizardFormState, StepValidationResult } from '../wizard-types.ts';
import type { ProficiencySelection, SkillName } from '../../../types/character.ts';
import { SKILL_NAMES, SKILL_ABILITY_MAP } from '../../../types/character.ts';
import type { ModuleClass, ModuleBackground } from '../../../types/module.ts';
import { packLoader } from '../../../services/pack-loader.ts';

@customElement('skills-step')
export class SkillsStep extends LitElement {
  static styles = [stepStyles, css`
    .skills-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--spacing-lg);
    }

    .skill-section {
      background: var(--color-surface);
      border-radius: var(--radius-md);
      padding: var(--spacing-lg);
    }

    .skill-section h3 {
      margin: 0 0 var(--spacing-sm);
    }

    .skill-section .count-info {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin-bottom: var(--spacing-md);
    }

    .skill-section .count-info.error {
      color: var(--color-danger);
    }

    .skill-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .skill-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm);
      border-radius: var(--radius-sm);
      transition: background-color 0.2s;
    }

    .skill-item:hover {
      background: var(--color-background);
    }

    .skill-item input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .skill-item input[type="checkbox"]:disabled {
      cursor: not-allowed;
    }

    .skill-item .skill-info {
      flex: 1;
    }

    .skill-item .skill-name {
      font-weight: 500;
    }

    .skill-item .skill-ability {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    .skill-item.granted {
      opacity: 0.7;
    }

    .skill-item.granted .skill-name::after {
      content: ' (granted)';
      font-size: var(--font-size-sm);
      color: var(--color-success);
    }

    .language-section,
    .tool-section {
      margin-top: var(--spacing-lg);
      padding: var(--spacing-md);
      background: var(--color-background);
      border-radius: var(--radius-md);
    }

    .granted-proficiencies {
      margin-top: var(--spacing-lg);
    }

    .proficiency-tags {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-xs);
      margin-top: var(--spacing-sm);
    }

    .proficiency-tag {
      background: var(--color-surface);
      padding: 4px 12px;
      border-radius: var(--radius-sm);
      font-size: var(--font-size-sm);
    }

    .proficiency-tag.armor {
      border-left: 3px solid var(--color-primary);
    }

    .proficiency-tag.weapon {
      border-left: 3px solid var(--color-danger);
    }

    .proficiency-tag.tool {
      border-left: 3px solid var(--color-warning);
    }

    .proficiency-tag.save {
      border-left: 3px solid var(--color-success);
    }
  `];

  @property({ type: Object }) formState!: WizardFormState;
  @state() private selectedClass: ModuleClass | null = null;
  @state() private selectedBackground: ModuleBackground | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.loadSelections();
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('formState')) {
      this.loadSelections();
    }
  }

  private loadSelections() {
    const classId = this.formState.character.selections.class?.classId;
    const backgroundId = this.formState.character.selections.background?.backgroundId;

    if (classId) {
      const classes = packLoader.getAllClasses();
      this.selectedClass = classes.find(c => c.id === classId) ?? null;
    }

    if (backgroundId) {
      const backgrounds = packLoader.getAllBackgrounds();
      this.selectedBackground = backgrounds.find(b => b.id === backgroundId) ?? null;
    }
  }

  private dispatchUpdate(proficiencies: Partial<ProficiencySelection>) {
    const current = this.formState.character.selections.proficiencies;
    this.dispatchEvent(new CustomEvent('selection-update', {
      detail: {
        proficiencies: { ...current, ...proficiencies },
      },
      bubbles: true,
      composed: true,
    }));
  }

  static validate(formState: WizardFormState): StepValidationResult {
    const errors: string[] = [];
    const { character } = formState;
    const { proficiencies } = character.selections;

    // Get class skill choices
    const classId = character.selections.class?.classId;
    if (classId) {
      const classes = packLoader.getAllClasses();
      const selectedClass = classes.find(c => c.id === classId);

      if (selectedClass?.skillChoices) {
        const classSkillOptions = new Set(selectedClass.skillChoices.options.map(s => s.toLowerCase().replace(/ /g, '')));
        const chosenClassSkills = proficiencies.skills.filter(s => classSkillOptions.has(s.toLowerCase()));

        if (chosenClassSkills.length < selectedClass.skillChoices.count) {
          errors.push(`Please select ${selectedClass.skillChoices.count} class skills`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private getClassSkillOptions(): string[] {
    if (!this.selectedClass?.skillChoices) return [];
    return this.selectedClass.skillChoices.options.map(s => s.toLowerCase().replace(/ /g, ''));
  }

  private handleSkillToggle(skill: SkillName, checked: boolean) {
    const current = this.formState.character.selections.proficiencies.skills;

    if (checked) {
      if (!current.includes(skill)) {
        this.dispatchUpdate({ skills: [...current, skill] });
      }
    } else {
      this.dispatchUpdate({ skills: current.filter(s => s !== skill) });
    }
  }

  private normalizeSkillName(skill: string): SkillName | null {
    const normalized = skill.toLowerCase().replace(/ /g, '');
    const match = SKILL_NAMES.find(s => s.toLowerCase() === normalized);
    return match ?? null;
  }

  private renderClassSkills() {
    if (!this.selectedClass?.skillChoices) return null;

    const { count, options } = this.selectedClass.skillChoices;
    const currentSkills = this.formState.character.selections.proficiencies.skills;
    const classSkillOptions = this.getClassSkillOptions();
    const chosenCount = currentSkills.filter(s => classSkillOptions.includes(s.toLowerCase())).length;

    return html`
      <div class="skill-section">
        <h3>Class Skills (${this.selectedClass.name})</h3>
        <p class="count-info ${chosenCount < count ? 'error' : ''}">
          Choose ${count} skills: ${chosenCount}/${count} selected
        </p>
        <div class="skill-list">
          ${options.map(optionName => {
            const skill = this.normalizeSkillName(optionName);
            if (!skill) return null;

            const isSelected = currentSkills.includes(skill);
            const canSelect = isSelected || chosenCount < count;

            return html`
              <label class="skill-item">
                <input
                  type="checkbox"
                  .checked=${isSelected}
                  ?disabled=${!canSelect && !isSelected}
                  @change=${(e: Event) => this.handleSkillToggle(skill, (e.target as HTMLInputElement).checked)}
                />
                <span class="skill-info">
                  <span class="skill-name">${optionName}</span>
                  <span class="skill-ability">(${SKILL_ABILITY_MAP[skill]})</span>
                </span>
              </label>
            `;
          })}
        </div>
      </div>
    `;
  }

  private renderGrantedProficiencies() {
    const armor: string[] = [];
    const weapons: string[] = [];
    const tools: string[] = [];
    const saves: string[] = [];

    if (this.selectedClass) {
      if (this.selectedClass.proficiencies?.armor) {
        armor.push(...this.selectedClass.proficiencies.armor);
      }
      if (this.selectedClass.proficiencies?.weapons) {
        weapons.push(...this.selectedClass.proficiencies.weapons);
      }
      if (this.selectedClass.proficiencies?.tools) {
        tools.push(...this.selectedClass.proficiencies.tools);
      }
      if (this.selectedClass.savingThrows) {
        saves.push(...this.selectedClass.savingThrows);
      }
    }

    if (this.selectedBackground) {
      if (this.selectedBackground.toolProficiencies) {
        tools.push(...this.selectedBackground.toolProficiencies);
      }
    }

    if (armor.length === 0 && weapons.length === 0 && tools.length === 0 && saves.length === 0) {
      return null;
    }

    return html`
      <div class="granted-proficiencies">
        <h3 class="section-title">Granted Proficiencies</h3>

        ${saves.length > 0 ? html`
          <h4>Saving Throws</h4>
          <div class="proficiency-tags">
            ${saves.map(save => html`
              <span class="proficiency-tag save">${save}</span>
            `)}
          </div>
        ` : ''}

        ${armor.length > 0 ? html`
          <h4>Armor</h4>
          <div class="proficiency-tags">
            ${armor.map(a => html`
              <span class="proficiency-tag armor">${a}</span>
            `)}
          </div>
        ` : ''}

        ${weapons.length > 0 ? html`
          <h4>Weapons</h4>
          <div class="proficiency-tags">
            ${weapons.map(w => html`
              <span class="proficiency-tag weapon">${w}</span>
            `)}
          </div>
        ` : ''}

        ${tools.length > 0 ? html`
          <h4>Tools</h4>
          <div class="proficiency-tags">
            ${tools.map(t => html`
              <span class="proficiency-tag tool">${t}</span>
            `)}
          </div>
        ` : ''}
      </div>
    `;
  }

  private renderBackgroundSkills() {
    if (!this.selectedBackground?.skillProficiencies.length) return null;

    return html`
      <div class="skill-section">
        <h3>Background Skills (${this.selectedBackground.name})</h3>
        <p class="count-info">Automatically granted</p>
        <div class="skill-list">
          ${this.selectedBackground.skillProficiencies.map(skillName => {
            const skill = this.normalizeSkillName(skillName);
            return html`
              <label class="skill-item granted">
                <input type="checkbox" checked disabled />
                <span class="skill-info">
                  <span class="skill-name">${skillName}</span>
                  ${skill ? html`<span class="skill-ability">(${SKILL_ABILITY_MAP[skill]})</span>` : ''}
                </span>
              </label>
            `;
          })}
        </div>
      </div>
    `;
  }

  render() {
    if (!this.selectedClass && !this.selectedBackground) {
      return html`
        <div class="step-container">
          <h2 class="step-title">Skills & Proficiencies</h2>
          <div class="info-box warning">
            <p>Please select a class and background first to determine your skill options.</p>
          </div>
        </div>
      `;
    }

    return html`
      <div class="step-container">
        <h2 class="step-title">Skills & Proficiencies</h2>
        <p class="step-description">
          Choose your skill proficiencies based on your class and background.
        </p>

        <div class="skills-container">
          ${this.renderClassSkills()}
          ${this.renderBackgroundSkills()}
        </div>

        ${this.renderGrantedProficiencies()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'skills-step': SkillsStep;
  }
}
