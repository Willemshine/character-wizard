import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
// Choice resolver types (unused for now but available for future use)
// import type { ChoiceOption, SpellChoiceConfig, SpellOptionData, ChoiceSelectionEvent } from './choice-resolver-types.ts';
import type { ModuleSpell, SpellcastingConfig } from '../../types/module.ts';
import { packLoader } from '../../services/pack-loader.ts';
import './choice-resolver.ts';

/**
 * Specialized spell choice resolver component
 *
 * Features:
 * - Searchable spell list
 * - Filter by school, level, ritual, concentration
 * - Shows spell details on hover/focus
 * - Enforces max picks based on class+level
 *
 * @fires selection-change - When spell selection changes
 */
@customElement('spell-choice-resolver')
export class SpellChoiceResolver extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .spell-resolver {
      background: var(--color-surface, #f5f5f5);
      border-radius: var(--radius-md, 8px);
      padding: var(--spacing-lg, 16px);
    }

    .spell-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--spacing-md, 12px);
    }

    .spell-title {
      font-size: var(--font-size-lg, 18px);
      font-weight: 600;
      margin: 0;
    }

    .spell-stats {
      display: flex;
      gap: var(--spacing-md, 12px);
    }

    .stat-badge {
      padding: 4px 12px;
      background: var(--color-background, #fff);
      border-radius: var(--radius-sm, 4px);
      font-size: var(--font-size-sm, 14px);
    }

    .stat-badge.valid {
      color: var(--color-success, #4caf50);
    }

    .stat-badge.invalid {
      color: var(--color-danger, #f44336);
    }

    .filters-row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-sm, 8px);
      margin-bottom: var(--spacing-md, 12px);
    }

    .search-input {
      flex: 1;
      min-width: 200px;
      padding: var(--spacing-sm, 8px) var(--spacing-md, 12px);
      border: 1px solid var(--color-border, #ddd);
      border-radius: var(--radius-sm, 4px);
      font-size: var(--font-size-md, 16px);
      background: var(--color-background, #fff);
    }

    .search-input:focus {
      outline: none;
      border-color: var(--color-primary, #5c6bc0);
      box-shadow: 0 0 0 2px rgba(92, 107, 192, 0.2);
    }

    .filter-select {
      padding: var(--spacing-sm, 8px);
      border: 1px solid var(--color-border, #ddd);
      border-radius: var(--radius-sm, 4px);
      background: var(--color-background, #fff);
      font-size: var(--font-size-sm, 14px);
    }

    .filter-toggle {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: var(--spacing-sm, 8px) var(--spacing-md, 12px);
      border: 1px solid var(--color-border, #ddd);
      border-radius: var(--radius-sm, 4px);
      background: var(--color-background, #fff);
      font-size: var(--font-size-sm, 14px);
      cursor: pointer;
      transition: all 0.2s;
    }

    .filter-toggle:hover {
      border-color: var(--color-primary-light, #7986cb);
    }

    .filter-toggle.active {
      background: var(--color-primary, #5c6bc0);
      border-color: var(--color-primary, #5c6bc0);
      color: white;
    }

    .spell-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm, 8px);
      max-height: 500px;
      overflow-y: auto;
    }

    .spell-card {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: var(--spacing-md, 12px);
      padding: var(--spacing-md, 12px);
      background: var(--color-background, #fff);
      border: 2px solid var(--color-border, #ddd);
      border-radius: var(--radius-md, 8px);
      cursor: pointer;
      transition: all 0.2s;
    }

    .spell-card:hover:not(.disabled) {
      border-color: var(--color-primary-light, #7986cb);
    }

    .spell-card.selected {
      border-color: var(--color-primary, #5c6bc0);
      background: rgba(92, 107, 192, 0.05);
    }

    .spell-card.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .spell-checkbox {
      display: flex;
      align-items: center;
      padding-top: 2px;
    }

    .spell-checkbox input {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .spell-main {
      min-width: 0;
    }

    .spell-name-row {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm, 8px);
      margin-bottom: 4px;
    }

    .spell-name {
      font-weight: 600;
      font-size: var(--font-size-md, 16px);
    }

    .spell-school {
      font-size: 11px;
      padding: 2px 6px;
      background: var(--color-surface, #f5f5f5);
      border-radius: var(--radius-sm, 4px);
      text-transform: capitalize;
    }

    .spell-badges {
      display: flex;
      gap: 4px;
    }

    .spell-badge {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: var(--radius-sm, 4px);
      text-transform: uppercase;
      font-weight: 600;
    }

    .spell-badge.ritual {
      background: rgba(76, 175, 80, 0.2);
      color: var(--color-success, #4caf50);
    }

    .spell-badge.concentration {
      background: rgba(255, 152, 0, 0.2);
      color: var(--color-warning, #ff9800);
    }

    .spell-meta {
      font-size: var(--font-size-sm, 14px);
      color: var(--color-text-secondary, #666);
      margin-bottom: 4px;
    }

    .spell-description {
      font-size: var(--font-size-sm, 14px);
      color: var(--color-text-secondary, #666);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .spell-components {
      display: flex;
      gap: 4px;
      align-items: flex-start;
      padding-top: 4px;
    }

    .component-badge {
      font-size: 11px;
      padding: 2px 6px;
      background: var(--color-surface, #f5f5f5);
      border-radius: var(--radius-sm, 4px);
      font-weight: 500;
    }

    .spell-level-section {
      margin-bottom: var(--spacing-lg, 16px);
    }

    .level-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-sm, 8px);
      padding-bottom: var(--spacing-xs, 4px);
      border-bottom: 1px solid var(--color-border, #ddd);
    }

    .level-title {
      font-size: var(--font-size-md, 16px);
      font-weight: 600;
      margin: 0;
    }

    .level-count {
      font-size: var(--font-size-sm, 14px);
      color: var(--color-text-secondary, #666);
    }

    .empty-state {
      text-align: center;
      padding: var(--spacing-xl, 24px);
      color: var(--color-text-secondary, #666);
    }

    /* Selected spells summary */
    .selected-summary {
      margin-bottom: var(--spacing-md, 12px);
      padding: var(--spacing-md, 12px);
      background: rgba(92, 107, 192, 0.1);
      border-radius: var(--radius-md, 8px);
    }

    .selected-summary h4 {
      margin: 0 0 var(--spacing-sm, 8px);
      font-size: var(--font-size-sm, 14px);
      color: var(--color-text-secondary, #666);
    }

    .selected-chips {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-xs, 4px);
    }

    .selected-chip {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      background: var(--color-background, #fff);
      border-radius: var(--radius-sm, 4px);
      font-size: var(--font-size-sm, 14px);
    }

    .selected-chip .remove-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      border: none;
      background: var(--color-surface, #f5f5f5);
      border-radius: 50%;
      cursor: pointer;
      font-size: 12px;
      line-height: 1;
    }

    .selected-chip .remove-btn:hover {
      background: var(--color-danger, #f44336);
      color: white;
    }

    /* Scrollbar */
    .spell-list::-webkit-scrollbar {
      width: 8px;
    }

    .spell-list::-webkit-scrollbar-track {
      background: var(--color-surface, #f5f5f5);
      border-radius: 4px;
    }

    .spell-list::-webkit-scrollbar-thumb {
      background: var(--color-border, #ddd);
      border-radius: 4px;
    }
  `;

  @property({ type: String }) classId = '';
  @property({ type: Number }) characterLevel = 1;
  @property({ type: Object }) spellcasting: SpellcastingConfig | null = null;
  @property({ type: Array }) selectedCantrips: string[] = [];
  @property({ type: Array }) selectedSpells: string[] = [];

  @state() private searchQuery = '';
  @state() private schoolFilter = '';
  @state() private levelFilter: number | null = null;
  @state() private showRitualOnly = false;
  @state() private showConcentrationOnly = false;

  private get allSpells(): ModuleSpell[] {
    return packLoader.getAllSpells();
  }

  private get classSpells(): ModuleSpell[] {
    if (!this.classId) return [];
    return this.allSpells.filter(spell =>
      spell.classes.includes(this.classId) ||
      spell.classes.map(c => c.toLowerCase()).includes(this.classId.toLowerCase())
    );
  }

  private get cantripsKnown(): number {
    if (!this.spellcasting?.cantripsKnown) return 0;
    const index = Math.min(this.characterLevel - 1, this.spellcasting.cantripsKnown.length - 1);
    return this.spellcasting.cantripsKnown[index] ?? 0;
  }

  private get spellsKnown(): number {
    if (!this.spellcasting?.spellsKnown) return 0;
    const index = Math.min(this.characterLevel - 1, this.spellcasting.spellsKnown.length - 1);
    return this.spellcasting.spellsKnown[index] ?? 0;
  }

  private get maxSpellLevel(): number {
    if (!this.spellcasting) return 0;
    const level = this.characterLevel;
    switch (this.spellcasting.type) {
      case 'full':
        return Math.min(9, Math.ceil(level / 2));
      case 'half':
        return level >= 2 ? Math.min(5, Math.ceil(level / 4)) : 0;
      case 'third':
        return level >= 3 ? Math.min(4, Math.ceil(level / 6)) : 0;
      case 'pact':
        return Math.min(5, Math.ceil(level / 2));
      default:
        return 0;
    }
  }

  private get filteredSpells(): ModuleSpell[] {
    let spells = this.classSpells;

    // Search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      spells = spells.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.school.toLowerCase().includes(query)
      );
    }

    // School filter
    if (this.schoolFilter) {
      spells = spells.filter(s => s.school === this.schoolFilter);
    }

    // Level filter
    if (this.levelFilter !== null) {
      spells = spells.filter(s => s.level === this.levelFilter);
    }

    // Ritual filter
    if (this.showRitualOnly) {
      spells = spells.filter(s => s.ritual);
    }

    // Concentration filter
    if (this.showConcentrationOnly) {
      spells = spells.filter(s => s.concentration);
    }

    return spells;
  }

  private get spellSchools(): string[] {
    const schools = new Set(this.classSpells.map(s => s.school));
    return Array.from(schools).sort();
  }

  private handleSearchInput(e: Event) {
    this.searchQuery = (e.target as HTMLInputElement).value;
  }

  private handleSchoolFilter(e: Event) {
    this.schoolFilter = (e.target as HTMLSelectElement).value;
  }

  private handleLevelFilter(e: Event) {
    const value = (e.target as HTMLSelectElement).value;
    this.levelFilter = value === '' ? null : parseInt(value);
  }

  private toggleRitualFilter() {
    this.showRitualOnly = !this.showRitualOnly;
  }

  private toggleConcentrationFilter() {
    this.showConcentrationOnly = !this.showConcentrationOnly;
  }

  private handleSpellToggle(spell: ModuleSpell) {
    const isCantrip = spell.level === 0;
    const currentList = isCantrip ? this.selectedCantrips : this.selectedSpells;
    const maxCount = isCantrip ? this.cantripsKnown : this.spellsKnown;
    const isSelected = currentList.includes(spell.id);

    let newList: string[];
    if (isSelected) {
      newList = currentList.filter(id => id !== spell.id);
    } else if (currentList.length < maxCount) {
      newList = [...currentList, spell.id];
    } else {
      return; // At max
    }

    this.dispatchEvent(new CustomEvent('selection-change', {
      detail: {
        choiceId: isCantrip ? 'cantrips' : 'spells',
        selectedIds: newList,
        isCantrip,
        validation: {
          isValid: true,
          errors: [],
          selectionsNeeded: Math.max(0, maxCount - newList.length),
          selectionsRemaining: maxCount - newList.length,
        },
      },
      bubbles: true,
      composed: true,
    }));
  }

  private handleRemoveSpell(spellId: string, isCantrip: boolean) {
    const currentList = isCantrip ? this.selectedCantrips : this.selectedSpells;
    const newList = currentList.filter(id => id !== spellId);

    this.dispatchEvent(new CustomEvent('selection-change', {
      detail: {
        choiceId: isCantrip ? 'cantrips' : 'spells',
        selectedIds: newList,
        isCantrip,
      },
      bubbles: true,
      composed: true,
    }));
  }

  private renderFilters() {
    return html`
      <div class="filters-row">
        <input
          type="text"
          class="search-input"
          placeholder="Search spells..."
          .value=${this.searchQuery}
          @input=${this.handleSearchInput}
        />
        <select class="filter-select" @change=${this.handleSchoolFilter}>
          <option value="">All Schools</option>
          ${this.spellSchools.map(school => html`
            <option value=${school} ?selected=${this.schoolFilter === school}>
              ${school.charAt(0).toUpperCase() + school.slice(1)}
            </option>
          `)}
        </select>
        <select class="filter-select" @change=${this.handleLevelFilter}>
          <option value="">All Levels</option>
          <option value="0" ?selected=${this.levelFilter === 0}>Cantrips</option>
          ${Array.from({ length: this.maxSpellLevel }, (_, i) => i + 1).map(lvl => html`
            <option value=${lvl} ?selected=${this.levelFilter === lvl}>Level ${lvl}</option>
          `)}
        </select>
        <button
          class="filter-toggle ${this.showRitualOnly ? 'active' : ''}"
          @click=${this.toggleRitualFilter}
        >Ritual</button>
        <button
          class="filter-toggle ${this.showConcentrationOnly ? 'active' : ''}"
          @click=${this.toggleConcentrationFilter}
        >Concentration</button>
      </div>
    `;
  }

  private renderSelectedSummary() {
    const selectedCantripSpells = this.selectedCantrips
      .map(id => this.allSpells.find(s => s.id === id))
      .filter(Boolean) as ModuleSpell[];
    const selectedKnownSpells = this.selectedSpells
      .map(id => this.allSpells.find(s => s.id === id))
      .filter(Boolean) as ModuleSpell[];

    if (selectedCantripSpells.length === 0 && selectedKnownSpells.length === 0) {
      return null;
    }

    return html`
      <div class="selected-summary">
        ${selectedCantripSpells.length > 0 ? html`
          <h4>Selected Cantrips (${selectedCantripSpells.length}/${this.cantripsKnown})</h4>
          <div class="selected-chips">
            ${selectedCantripSpells.map(spell => html`
              <span class="selected-chip">
                ${spell.name}
                <button
                  class="remove-btn"
                  @click=${() => this.handleRemoveSpell(spell.id, true)}
                >×</button>
              </span>
            `)}
          </div>
        ` : ''}
        ${selectedKnownSpells.length > 0 ? html`
          <h4>Selected Spells (${selectedKnownSpells.length}/${this.spellsKnown})</h4>
          <div class="selected-chips">
            ${selectedKnownSpells.map(spell => html`
              <span class="selected-chip">
                ${spell.name}
                <button
                  class="remove-btn"
                  @click=${() => this.handleRemoveSpell(spell.id, false)}
                >×</button>
              </span>
            `)}
          </div>
        ` : ''}
      </div>
    `;
  }

  private renderSpellCard(spell: ModuleSpell) {
    const isCantrip = spell.level === 0;
    const isSelected = isCantrip
      ? this.selectedCantrips.includes(spell.id)
      : this.selectedSpells.includes(spell.id);
    const maxCount = isCantrip ? this.cantripsKnown : this.spellsKnown;
    const currentCount = isCantrip ? this.selectedCantrips.length : this.selectedSpells.length;
    const canSelect = isSelected || currentCount < maxCount;

    const classes = [
      'spell-card',
      isSelected ? 'selected' : '',
      !canSelect ? 'disabled' : '',
    ].filter(Boolean).join(' ');

    return html`
      <div
        class=${classes}
        @click=${() => canSelect || isSelected ? this.handleSpellToggle(spell) : null}
      >
        <div class="spell-checkbox">
          <input
            type="checkbox"
            .checked=${isSelected}
            .disabled=${!canSelect && !isSelected}
            @click=${(e: Event) => e.stopPropagation()}
            @change=${() => this.handleSpellToggle(spell)}
          />
        </div>
        <div class="spell-main">
          <div class="spell-name-row">
            <span class="spell-name">${spell.name}</span>
            <span class="spell-school">${spell.school}</span>
            <div class="spell-badges">
              ${spell.ritual ? html`<span class="spell-badge ritual">Ritual</span>` : ''}
              ${spell.concentration ? html`<span class="spell-badge concentration">Conc</span>` : ''}
            </div>
          </div>
          <div class="spell-meta">
            ${spell.castingTime} | ${spell.range} | ${spell.duration}
          </div>
          <div class="spell-description">${spell.description}</div>
        </div>
        <div class="spell-components">
          ${spell.components.verbal ? html`<span class="component-badge">V</span>` : ''}
          ${spell.components.somatic ? html`<span class="component-badge">S</span>` : ''}
          ${spell.components.material ? html`
            <span class="component-badge" title=${spell.components.material}>M</span>
          ` : ''}
        </div>
      </div>
    `;
  }

  private renderSpellsByLevel() {
    // Group spells by level
    const spellsByLevel = new Map<number, ModuleSpell[]>();
    for (const spell of this.filteredSpells) {
      const level = spell.level;
      if (level <= this.maxSpellLevel) {
        const existing = spellsByLevel.get(level) ?? [];
        spellsByLevel.set(level, [...existing, spell]);
      }
    }

    if (spellsByLevel.size === 0) {
      return html`
        <div class="empty-state">
          ${this.searchQuery || this.schoolFilter || this.levelFilter !== null
            ? 'No spells match your filters'
            : 'No spells available for your class'}
        </div>
      `;
    }

    // Sort by level
    const sortedLevels = Array.from(spellsByLevel.keys()).sort((a, b) => a - b);

    return html`
      ${sortedLevels.map(level => {
        const spells = spellsByLevel.get(level) ?? [];
        const isCantrip = level === 0;

        return html`
          <div class="spell-level-section">
            <div class="level-header">
              <h4 class="level-title">${isCantrip ? 'Cantrips' : `Level ${level} Spells`}</h4>
              <span class="level-count">${spells.length} available</span>
            </div>
            <div class="spell-list">
              ${spells.map(spell => this.renderSpellCard(spell))}
            </div>
          </div>
        `;
      })}
    `;
  }

  render() {
    if (!this.spellcasting) {
      return html`
        <div class="spell-resolver">
          <div class="empty-state">No spellcasting available for this class</div>
        </div>
      `;
    }

    const cantripCount = this.selectedCantrips.length;
    const spellCount = this.selectedSpells.length;
    const cantripValid = cantripCount <= this.cantripsKnown;
    const spellValid = spellCount <= this.spellsKnown;

    return html`
      <div class="spell-resolver">
        <div class="spell-header">
          <h3 class="spell-title">Choose Spells</h3>
          <div class="spell-stats">
            ${this.cantripsKnown > 0 ? html`
              <span class="stat-badge ${cantripValid ? 'valid' : 'invalid'}">
                Cantrips: ${cantripCount}/${this.cantripsKnown}
              </span>
            ` : ''}
            ${this.spellsKnown > 0 ? html`
              <span class="stat-badge ${spellValid ? 'valid' : 'invalid'}">
                Spells: ${spellCount}/${this.spellsKnown}
              </span>
            ` : ''}
          </div>
        </div>

        ${this.renderSelectedSummary()}
        ${this.renderFilters()}
        ${this.renderSpellsByLevel()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'spell-choice-resolver': SpellChoiceResolver;
  }
}
