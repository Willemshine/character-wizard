import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { stepStyles } from '../step-styles.ts';
import type { WizardFormState, StepValidationResult } from '../wizard-types.ts';
import type { SpellSelection } from '../../../types/character.ts';
import type { ModuleClass, ModuleSpell, SpellcastingConfig } from '../../../types/module.ts';
import { packLoader } from '../../../services/pack-loader.ts';

@customElement('spells-step')
export class SpellsStep extends LitElement {
  static styles = [stepStyles, css`
    .spellcasting-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-xl);
      padding: var(--spacing-lg);
      background: var(--color-surface);
      border-radius: var(--radius-md);
    }

    .spell-stat {
      text-align: center;
    }

    .spell-stat .label {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      display: block;
    }

    .spell-stat .value {
      font-size: var(--font-size-xl);
      font-weight: 600;
      color: var(--color-primary);
    }

    .spell-level-section {
      margin-bottom: var(--spacing-xl);
    }

    .spell-level-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-md);
    }

    .spell-level-header h3 {
      margin: 0;
    }

    .spell-count {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    .spell-count.over {
      color: var(--color-danger);
    }

    .spell-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--spacing-md);
    }

    .spell-card {
      padding: var(--spacing-md);
      background: var(--color-background);
      border: 2px solid var(--color-border);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all 0.2s;
    }

    .spell-card:hover {
      border-color: var(--color-primary-light);
    }

    .spell-card.selected {
      border-color: var(--color-primary);
      background: rgba(92, 107, 192, 0.1);
    }

    .spell-card h4 {
      margin: 0 0 var(--spacing-xs);
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .spell-card .school {
      font-size: 11px;
      padding: 2px 6px;
      background: var(--color-surface);
      border-radius: var(--radius-sm);
      text-transform: capitalize;
    }

    .spell-card .spell-meta {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin-bottom: var(--spacing-sm);
    }

    .spell-card .spell-description {
      font-size: var(--font-size-sm);
      line-height: 1.4;
    }

    .spell-card .components {
      display: flex;
      gap: var(--spacing-xs);
      margin-top: var(--spacing-sm);
    }

    .spell-card .component {
      font-size: 11px;
      padding: 2px 6px;
      background: var(--color-surface);
      border-radius: var(--radius-sm);
    }

    .ritual-badge,
    .concentration-badge {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: var(--radius-sm);
      text-transform: uppercase;
      font-weight: 600;
    }

    .ritual-badge {
      background: rgba(76, 175, 80, 0.2);
      color: var(--color-success);
    }

    .concentration-badge {
      background: rgba(255, 152, 0, 0.2);
      color: var(--color-warning);
    }
  `];

  @property({ type: Object }) formState!: WizardFormState;
  @state() private selectedClass: ModuleClass | null = null;
  @state() private allSpells: ModuleSpell[] = [];
  @state() private classSpells: ModuleSpell[] = [];

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

    if (classId) {
      const classes = packLoader.getAllClasses();
      this.selectedClass = classes.find(c => c.id === classId) ?? null;
    }

    this.allSpells = packLoader.getAllSpells();

    // Filter spells by class
    if (this.selectedClass) {
      this.classSpells = this.allSpells.filter(spell =>
        spell.classes.includes(this.selectedClass!.id) ||
        spell.classes.includes(this.selectedClass!.name.toLowerCase())
      );
    } else {
      this.classSpells = [];
    }
  }

  private getSpellcastingConfig(): SpellcastingConfig | null {
    return this.selectedClass?.spellcasting ?? null;
  }

  private getCantripsKnown(): number {
    const config = this.getSpellcastingConfig();
    if (!config?.cantripsKnown) return 0;

    const level = this.formState.character.level;
    const index = Math.min(level - 1, config.cantripsKnown.length - 1);
    return config.cantripsKnown[index] ?? 0;
  }

  private getSpellsKnown(): number {
    const config = this.getSpellcastingConfig();
    if (!config?.spellsKnown) return 0;

    const level = this.formState.character.level;
    const index = Math.min(level - 1, config.spellsKnown.length - 1);
    return config.spellsKnown[index] ?? 0;
  }

  private dispatchUpdate(spells: Partial<SpellSelection>) {
    const current = this.formState.character.selections.spells;
    this.dispatchEvent(new CustomEvent('selection-update', {
      detail: {
        spells: { ...current, ...spells },
      },
      bubbles: true,
      composed: true,
    }));
  }

  static validate(formState: WizardFormState): StepValidationResult {
    const errors: string[] = [];

    // Spells are optional if not a spellcaster
    const classId = formState.character.selections.class?.classId;
    if (!classId) return { isValid: true, errors: [] };

    const classes = packLoader.getAllClasses();
    const selectedClass = classes.find(c => c.id === classId);

    if (!selectedClass?.spellcasting) {
      return { isValid: true, errors: [] };
    }

    // Could add validation for required number of cantrips/spells here

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static shouldShow(formState: WizardFormState): boolean {
    const classId = formState.character.selections.class?.classId;
    if (!classId) return false;

    const classes = packLoader.getAllClasses();
    const selectedClass = classes.find(c => c.id === classId);

    return selectedClass?.spellcasting !== undefined;
  }

  private handleSpellToggle(spellId: string, isCantrip: boolean) {
    const current = this.formState.character.selections.spells;

    if (isCantrip) {
      const cantrips = current.cantrips.includes(spellId)
        ? current.cantrips.filter(id => id !== spellId)
        : [...current.cantrips, spellId];
      this.dispatchUpdate({ cantrips });
    } else {
      const knownSpells = current.knownSpells.includes(spellId)
        ? current.knownSpells.filter(id => id !== spellId)
        : [...current.knownSpells, spellId];
      this.dispatchUpdate({ knownSpells });
    }
  }

  private renderSpellcastingInfo() {
    const config = this.getSpellcastingConfig();
    if (!config) return null;

    return html`
      <div class="spellcasting-info">
        <div class="spell-stat">
          <span class="label">Spellcasting Ability</span>
          <span class="value">${config.ability.slice(0, 3).toUpperCase()}</span>
        </div>
        <div class="spell-stat">
          <span class="label">Cantrips Known</span>
          <span class="value">${this.getCantripsKnown()}</span>
        </div>
        ${config.known ? html`
          <div class="spell-stat">
            <span class="label">Spells Known</span>
            <span class="value">${this.getSpellsKnown()}</span>
          </div>
        ` : ''}
        <div class="spell-stat">
          <span class="label">Caster Type</span>
          <span class="value">${config.type}</span>
        </div>
      </div>
    `;
  }

  private renderSpellCard(spell: ModuleSpell, isSelected: boolean, isCantrip: boolean) {
    return html`
      <div
        class="spell-card ${isSelected ? 'selected' : ''}"
        @click=${() => this.handleSpellToggle(spell.id, isCantrip)}
      >
        <h4>
          ${spell.name}
          <span class="school">${spell.school}</span>
          ${spell.ritual ? html`<span class="ritual-badge">Ritual</span>` : ''}
          ${spell.concentration ? html`<span class="concentration-badge">Conc</span>` : ''}
        </h4>
        <div class="spell-meta">
          ${spell.castingTime} | ${spell.range} | ${spell.duration}
        </div>
        <div class="spell-description">
          ${spell.description.slice(0, 100)}${spell.description.length > 100 ? '...' : ''}
        </div>
        <div class="components">
          ${spell.components.verbal ? html`<span class="component">V</span>` : ''}
          ${spell.components.somatic ? html`<span class="component">S</span>` : ''}
          ${spell.components.material ? html`<span class="component" title="${spell.components.material}">M</span>` : ''}
        </div>
      </div>
    `;
  }

  private renderSpellsByLevel(level: number) {
    const spells = this.classSpells.filter(s => s.level === level);
    if (spells.length === 0) return null;

    const isCantrip = level === 0;
    const { cantrips, knownSpells } = this.formState.character.selections.spells;
    const selectedSpells = isCantrip ? cantrips : knownSpells;
    const selectedCount = selectedSpells.length;
    const maxCount = isCantrip ? this.getCantripsKnown() : this.getSpellsKnown();

    const levelName = isCantrip ? 'Cantrips' : `Level ${level} Spells`;

    return html`
      <div class="spell-level-section">
        <div class="spell-level-header">
          <h3>${levelName}</h3>
          <span class="spell-count ${selectedCount > maxCount ? 'over' : ''}">
            ${selectedCount}/${maxCount} selected
          </span>
        </div>
        <div class="spell-grid">
          ${spells.map(spell => {
            const isSelected = selectedSpells.includes(spell.id);
            return this.renderSpellCard(spell, isSelected, isCantrip);
          })}
        </div>
      </div>
    `;
  }

  render() {
    const config = this.getSpellcastingConfig();

    if (!config) {
      return html`
        <div class="step-container">
          <h2 class="step-title">Spells</h2>
          <div class="info-box info">
            <p>Your class does not have spellcasting abilities.</p>
            <p>You can proceed to the next step.</p>
          </div>
        </div>
      `;
    }

    // Determine max spell level based on class and level
    const level = this.formState.character.level;
    let maxSpellLevel = 0;
    if (config.type === 'full') {
      maxSpellLevel = Math.min(9, Math.ceil(level / 2));
    } else if (config.type === 'half') {
      maxSpellLevel = level >= 2 ? Math.min(5, Math.ceil(level / 4)) : 0;
    } else if (config.type === 'third') {
      maxSpellLevel = level >= 3 ? Math.min(4, Math.ceil(level / 6)) : 0;
    } else if (config.type === 'pact') {
      maxSpellLevel = Math.min(5, Math.ceil(level / 2));
    }

    return html`
      <div class="step-container">
        <h2 class="step-title">Spells</h2>
        <p class="step-description">
          Choose your spells for your ${this.selectedClass?.name ?? 'class'}.
        </p>

        ${this.renderSpellcastingInfo()}

        ${this.classSpells.length > 0 ? html`
          ${this.renderSpellsByLevel(0)}
          ${Array.from({ length: maxSpellLevel }, (_, i) => i + 1).map(lvl =>
            this.renderSpellsByLevel(lvl)
          )}
        ` : html`
          <div class="info-box">
            <p>No spells available for ${this.selectedClass?.name ?? 'your class'}.</p>
            <p>Spell data may not be loaded, or your class spell list is empty.</p>
          </div>
        `}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'spells-step': SpellsStep;
  }
}
