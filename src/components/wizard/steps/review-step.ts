import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { stepStyles } from '../step-styles.ts';
import type { WizardFormState, StepValidationResult } from '../wizard-types.ts';
import {
  ABILITY_NAMES,
  calculateModifier,
  calculateFinalAbilityScores,
  calculateProficiencyBonus,
} from '../../../types/character.ts';
import type { ModuleRace, ModuleClass, ModuleBackground, ModuleSubrace, ModuleSubclass } from '../../../types/module.ts';
import { packLoader } from '../../../services/pack-loader.ts';

@customElement('review-step')
export class ReviewStep extends LitElement {
  static styles = [stepStyles, css`
    .review-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--spacing-lg);
    }

    .review-section {
      background: var(--color-surface);
      border-radius: var(--radius-md);
      padding: var(--spacing-lg);
    }

    .review-section h3 {
      margin: 0 0 var(--spacing-md);
      padding-bottom: var(--spacing-sm);
      border-bottom: 2px solid var(--color-primary);
      color: var(--color-primary);
    }

    .review-row {
      display: flex;
      justify-content: space-between;
      padding: var(--spacing-xs) 0;
    }

    .review-row .label {
      color: var(--color-text-secondary);
    }

    .review-row .value {
      font-weight: 500;
    }

    .ability-scores-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-sm);
      margin-top: var(--spacing-md);
    }

    .ability-box {
      text-align: center;
      padding: var(--spacing-sm);
      background: var(--color-background);
      border-radius: var(--radius-sm);
    }

    .ability-box .ability-name {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      text-transform: uppercase;
    }

    .ability-box .ability-score {
      font-size: var(--font-size-xl);
      font-weight: 600;
    }

    .ability-box .ability-modifier {
      font-size: var(--font-size-sm);
      color: var(--color-primary);
    }

    .stat-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--spacing-sm);
      margin-top: var(--spacing-md);
    }

    .stat-box {
      text-align: center;
      padding: var(--spacing-md);
      background: var(--color-background);
      border-radius: var(--radius-sm);
    }

    .stat-box .stat-value {
      font-size: var(--font-size-xl);
      font-weight: 600;
      color: var(--color-primary);
    }

    .stat-box .stat-label {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    .proficiency-list {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-xs);
      margin-top: var(--spacing-sm);
    }

    .proficiency-tag {
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

    .equipment-list li {
      margin-bottom: var(--spacing-xs);
    }

    .spell-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
      margin-top: var(--spacing-sm);
    }

    .spell-item {
      font-size: var(--font-size-sm);
      padding: var(--spacing-xs);
      background: var(--color-background);
      border-radius: var(--radius-sm);
    }

    .warning-box {
      background: rgba(255, 152, 0, 0.1);
      border-left: 3px solid var(--color-warning);
      padding: var(--spacing-md);
      border-radius: var(--radius-sm);
      margin-top: var(--spacing-lg);
    }

    .warning-box h4 {
      margin: 0 0 var(--spacing-sm);
      color: var(--color-warning);
    }

    .warning-list {
      margin: 0;
      padding-left: var(--spacing-lg);
    }

    .character-portrait {
      width: 100%;
      aspect-ratio: 1;
      background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 4rem;
      margin-bottom: var(--spacing-md);
    }
  `];

  @property({ type: Object }) formState!: WizardFormState;
  @state() private race: ModuleRace | null = null;
  @state() private subrace: ModuleSubrace | null = null;
  @state() private characterClass: ModuleClass | null = null;
  @state() private subclass: ModuleSubclass | null = null;
  @state() private background: ModuleBackground | null = null;

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
    const { selections } = this.formState.character;

    if (selections.race?.raceId) {
      const races = packLoader.getAllRaces();
      this.race = races.find(r => r.id === selections.race?.raceId) ?? null;

      if (selections.race.subraceId && this.race) {
        const subraces = packLoader.getSubracesForRace(this.race.id);
        this.subrace = subraces.find(s => s.id === selections.race?.subraceId) ?? null;
      } else {
        this.subrace = null;
      }
    }

    if (selections.class?.classId) {
      const classes = packLoader.getAllClasses();
      this.characterClass = classes.find(c => c.id === selections.class?.classId) ?? null;

      if (selections.class.subclassId && this.characterClass) {
        const subclasses = packLoader.getSubclassesForClass(this.characterClass.id);
        this.subclass = subclasses.find(s => s.id === selections.class?.subclassId) ?? null;
      } else {
        this.subclass = null;
      }
    }

    if (selections.background?.backgroundId) {
      const backgrounds = packLoader.getAllBackgrounds();
      this.background = backgrounds.find(b => b.id === selections.background?.backgroundId) ?? null;
    }
  }

  static validate(formState: WizardFormState): StepValidationResult {
    const errors: string[] = [];
    const { character } = formState;

    if (!character.name) {
      errors.push('Character name is required');
    }

    if (!character.selections.race) {
      errors.push('Race selection is required');
    }

    if (!character.selections.class) {
      errors.push('Class selection is required');
    }

    if (!character.selections.background) {
      errors.push('Background selection is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private getValidationWarnings(): string[] {
    const warnings: string[] = [];
    const { character } = this.formState;

    // Check for incomplete selections
    if (!character.name) warnings.push('Character name is not set');
    if (!character.selections.race) warnings.push('No race selected');
    if (!character.selections.class) warnings.push('No class selected');
    if (!character.selections.background) warnings.push('No background selected');

    // Check skills
    if (this.characterClass?.skillChoices) {
      const requiredSkills = this.characterClass.skillChoices.count;
      const selectedSkills = character.selections.proficiencies.skills.length;
      if (selectedSkills < requiredSkills) {
        warnings.push(`Only ${selectedSkills}/${requiredSkills} class skills selected`);
      }
    }

    return warnings;
  }

  private renderBasicInfo() {
    const { character } = this.formState;

    return html`
      <div class="review-section">
        <div class="character-portrait">
          ${character.name ? character.name[0].toUpperCase() : '?'}
        </div>
        <h3>Basic Info</h3>
        <div class="review-row">
          <span class="label">Name</span>
          <span class="value">${character.name || 'Unnamed'}</span>
        </div>
        ${character.playerName ? html`
          <div class="review-row">
            <span class="label">Player</span>
            <span class="value">${character.playerName}</span>
          </div>
        ` : ''}
        <div class="review-row">
          <span class="label">Level</span>
          <span class="value">${character.level}</span>
        </div>
        <div class="review-row">
          <span class="label">Edition</span>
          <span class="value">${character.edition}</span>
        </div>
      </div>
    `;
  }

  private renderCharacterDetails() {
    return html`
      <div class="review-section">
        <h3>Character</h3>
        <div class="review-row">
          <span class="label">Race</span>
          <span class="value">
            ${this.race?.name ?? 'Not selected'}
            ${this.subrace ? ` (${this.subrace.name})` : ''}
          </span>
        </div>
        <div class="review-row">
          <span class="label">Class</span>
          <span class="value">
            ${this.characterClass?.name ?? 'Not selected'}
            ${this.subclass ? ` - ${this.subclass.name}` : ''}
          </span>
        </div>
        <div class="review-row">
          <span class="label">Background</span>
          <span class="value">${this.background?.name ?? 'Not selected'}</span>
        </div>
      </div>
    `;
  }

  private renderAbilityScores() {
    const { selections } = this.formState.character;
    const finalScores = calculateFinalAbilityScores(selections.abilityScores);

    return html`
      <div class="review-section">
        <h3>Ability Scores</h3>
        <div class="ability-scores-grid">
          ${ABILITY_NAMES.map(ability => {
            const score = finalScores[ability];
            const modifier = calculateModifier(score);
            const modStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;

            return html`
              <div class="ability-box">
                <div class="ability-name">${ability.slice(0, 3)}</div>
                <div class="ability-score">${score}</div>
                <div class="ability-modifier">${modStr}</div>
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }

  private renderCombatStats() {
    const { character } = this.formState;
    const { selections } = character;
    const finalScores = calculateFinalAbilityScores(selections.abilityScores);
    const profBonus = calculateProficiencyBonus(character.level);
    const dexMod = calculateModifier(finalScores.dexterity);
    const conMod = calculateModifier(finalScores.constitution);

    const hitDie = this.characterClass?.hitDie ?? 8;
    const maxHP = hitDie + conMod; // Level 1 HP

    return html`
      <div class="review-section">
        <h3>Combat Stats</h3>
        <div class="stat-grid">
          <div class="stat-box">
            <div class="stat-value">${10 + dexMod}</div>
            <div class="stat-label">Armor Class</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${maxHP}</div>
            <div class="stat-label">Hit Points</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${dexMod >= 0 ? '+' : ''}${dexMod}</div>
            <div class="stat-label">Initiative</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">+${profBonus}</div>
            <div class="stat-label">Proficiency</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${this.race?.speed ?? 30}</div>
            <div class="stat-label">Speed</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">d${hitDie}</div>
            <div class="stat-label">Hit Die</div>
          </div>
        </div>
      </div>
    `;
  }

  private renderProficiencies() {
    const { proficiencies } = this.formState.character.selections;
    const allSkills: string[] = [...proficiencies.skills];

    // Add background skills
    if (this.background?.skillProficiencies) {
      for (const skill of this.background.skillProficiencies) {
        const normalized = skill.toLowerCase().replace(/ /g, '');
        if (!allSkills.some(s => s.toLowerCase() === normalized)) {
          allSkills.push(skill);
        }
      }
    }

    return html`
      <div class="review-section">
        <h3>Proficiencies</h3>

        <h4>Skills</h4>
        <div class="proficiency-list">
          ${allSkills.length > 0 ? allSkills.map(skill =>
            html`<span class="proficiency-tag">${skill}</span>`
          ) : html`<span class="proficiency-tag">None selected</span>`}
        </div>

        ${this.characterClass?.savingThrows ? html`
          <h4>Saving Throws</h4>
          <div class="proficiency-list">
            ${this.characterClass.savingThrows.map(save =>
              html`<span class="proficiency-tag">${save}</span>`
            )}
          </div>
        ` : ''}
      </div>
    `;
  }

  private renderEquipment() {
    const { equipment } = this.formState.character.selections;
    const allEquipment = packLoader.getAllEquipment();

    const items = equipment.startingEquipment.map(item => {
      const details = allEquipment.find(e => e.id === item.itemId);
      return `${details?.name ?? item.itemId}${item.quantity > 1 ? ` (x${item.quantity})` : ''}`;
    });

    // Add background equipment
    if (this.background?.equipment) {
      items.push(...this.background.equipment);
    }

    return html`
      <div class="review-section">
        <h3>Equipment</h3>
        ${items.length > 0 ? html`
          <ul class="equipment-list">
            ${items.map(item => html`<li>${item}</li>`)}
          </ul>
        ` : html`<p>No equipment selected</p>`}

        <h4>Currency</h4>
        <div class="review-row">
          <span class="label">Gold</span>
          <span class="value">
            ${equipment.currency.gp} gp,
            ${equipment.currency.sp} sp,
            ${equipment.currency.cp} cp
          </span>
        </div>
      </div>
    `;
  }

  private renderSpells() {
    const { spells } = this.formState.character.selections;

    if (spells.cantrips.length === 0 && spells.knownSpells.length === 0) {
      return null;
    }

    const allSpells = packLoader.getAllSpells();

    return html`
      <div class="review-section">
        <h3>Spells</h3>

        ${spells.cantrips.length > 0 ? html`
          <h4>Cantrips</h4>
          <div class="spell-list">
            ${spells.cantrips.map(id => {
              const spell = allSpells.find(s => s.id === id);
              return html`<div class="spell-item">${spell?.name ?? id}</div>`;
            })}
          </div>
        ` : ''}

        ${spells.knownSpells.length > 0 ? html`
          <h4>Known Spells</h4>
          <div class="spell-list">
            ${spells.knownSpells.map(id => {
              const spell = allSpells.find(s => s.id === id);
              return html`<div class="spell-item">${spell?.name ?? id}</div>`;
            })}
          </div>
        ` : ''}
      </div>
    `;
  }

  private renderWarnings() {
    const warnings = this.getValidationWarnings();

    if (warnings.length === 0) return null;

    return html`
      <div class="warning-box">
        <h4>Incomplete Selections</h4>
        <ul class="warning-list">
          ${warnings.map(warning => html`<li>${warning}</li>`)}
        </ul>
      </div>
    `;
  }

  render() {
    return html`
      <div class="step-container">
        <h2 class="step-title">Review Your Character</h2>
        <p class="step-description">
          Review your character before finalizing. You can go back to any step to make changes.
        </p>

        ${this.renderWarnings()}

        <div class="review-container">
          ${this.renderBasicInfo()}
          ${this.renderCharacterDetails()}
          ${this.renderAbilityScores()}
          ${this.renderCombatStats()}
          ${this.renderProficiencies()}
          ${this.renderEquipment()}
          ${this.renderSpells()}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'review-step': ReviewStep;
  }
}
