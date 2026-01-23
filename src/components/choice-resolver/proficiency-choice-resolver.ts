import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { SkillName, AbilityName } from '../../types/character.ts';
import { SKILL_NAMES, SKILL_ABILITY_MAP } from '../../types/character.ts';
import type { ProficiencyChoice, GrantedProficiencies } from '../../types/module.ts';
import './choice-resolver.ts';

/**
 * Proficiency type for categorization
 */
export type ProficiencyType = 'skill' | 'tool' | 'weapon' | 'armor' | 'language' | 'savingThrow';

/**
 * Represents a source of proficiency choices (class, race, background, etc.)
 */
export interface ProficiencySource {
  /** Source identifier */
  id: string;
  /** Display name (e.g., "Fighter", "Human", "Acolyte") */
  name: string;
  /** Type of source */
  type: 'class' | 'race' | 'subrace' | 'background' | 'feat' | 'other';
  /** Proficiencies granted automatically */
  granted?: GrantedProficiencies;
  /** Choices to make */
  choices?: {
    skills?: ProficiencyChoice;
    tools?: ProficiencyChoice;
    weapons?: ProficiencyChoice;
    languages?: ProficiencyChoice;
  };
}

/**
 * Skill data for display
 */
interface SkillData {
  id: SkillName;
  name: string;
  ability: AbilityName;
}

const SKILL_DATA: SkillData[] = SKILL_NAMES.map(skill => ({
  id: skill,
  name: skill.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
  ability: SKILL_ABILITY_MAP[skill],
}));

/**
 * Specialized proficiency choice resolver component
 *
 * Handles proficiency selections from multiple sources (class, race, background)
 * with proper conflict resolution and display of granted proficiencies.
 *
 * @fires selection-change - When proficiency selection changes
 */
@customElement('proficiency-choice-resolver')
export class ProficiencyChoiceResolver extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .proficiency-resolver {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg, 16px);
    }

    /* Source section */
    .source-section {
      background: var(--color-surface, #f5f5f5);
      border-radius: var(--radius-md, 8px);
      padding: var(--spacing-lg, 16px);
    }

    .source-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-md, 12px);
    }

    .source-title {
      font-size: var(--font-size-lg, 18px);
      font-weight: 600;
      margin: 0;
      display: flex;
      align-items: center;
      gap: var(--spacing-sm, 8px);
    }

    .source-badge {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: var(--radius-sm, 4px);
      text-transform: uppercase;
    }

    .source-badge.class {
      background: rgba(92, 107, 192, 0.2);
      color: var(--color-primary, #5c6bc0);
    }

    .source-badge.race {
      background: rgba(76, 175, 80, 0.2);
      color: var(--color-success, #4caf50);
    }

    .source-badge.background {
      background: rgba(255, 152, 0, 0.2);
      color: var(--color-warning, #ff9800);
    }

    .source-badge.feat {
      background: rgba(156, 39, 176, 0.2);
      color: #9c27b0;
    }

    .selection-status {
      font-size: var(--font-size-sm, 14px);
      padding: 4px 12px;
      border-radius: var(--radius-sm, 4px);
      background: var(--color-background, #fff);
    }

    .selection-status.valid {
      color: var(--color-success, #4caf50);
    }

    .selection-status.invalid {
      color: var(--color-danger, #f44336);
    }

    /* Proficiency type section */
    .proficiency-type-section {
      margin-bottom: var(--spacing-md, 12px);
    }

    .proficiency-type-section:last-child {
      margin-bottom: 0;
    }

    .type-header {
      font-size: var(--font-size-sm, 14px);
      font-weight: 600;
      color: var(--color-text-secondary, #666);
      margin-bottom: var(--spacing-sm, 8px);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Proficiency list */
    .proficiency-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs, 4px);
    }

    .proficiency-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm, 8px);
      padding: var(--spacing-sm, 8px) var(--spacing-md, 12px);
      background: var(--color-background, #fff);
      border: 1px solid var(--color-border, #ddd);
      border-radius: var(--radius-sm, 4px);
      cursor: pointer;
      transition: all 0.2s;
    }

    .proficiency-item:hover:not(.disabled):not(.granted) {
      border-color: var(--color-primary-light, #7986cb);
      background: rgba(92, 107, 192, 0.05);
    }

    .proficiency-item.selected {
      border-color: var(--color-primary, #5c6bc0);
      background: rgba(92, 107, 192, 0.1);
    }

    .proficiency-item.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .proficiency-item.granted {
      opacity: 0.8;
      background: rgba(76, 175, 80, 0.1);
      border-color: var(--color-success, #4caf50);
      cursor: default;
    }

    .proficiency-item.conflict {
      background: rgba(255, 152, 0, 0.1);
      border-color: var(--color-warning, #ff9800);
    }

    .proficiency-checkbox {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }

    .proficiency-info {
      flex: 1;
      min-width: 0;
    }

    .proficiency-name {
      font-weight: 500;
      color: var(--color-text-primary, #1a1a1a);
    }

    .proficiency-detail {
      font-size: var(--font-size-sm, 14px);
      color: var(--color-text-secondary, #666);
    }

    .proficiency-badge {
      font-size: 11px;
      padding: 2px 6px;
      border-radius: var(--radius-sm, 4px);
    }

    .proficiency-badge.granted {
      background: rgba(76, 175, 80, 0.2);
      color: var(--color-success, #4caf50);
    }

    .proficiency-badge.conflict {
      background: rgba(255, 152, 0, 0.2);
      color: var(--color-warning, #ff9800);
    }

    /* Granted proficiencies summary */
    .granted-summary {
      margin-top: var(--spacing-md, 12px);
      padding: var(--spacing-md, 12px);
      background: rgba(76, 175, 80, 0.05);
      border-radius: var(--radius-md, 8px);
      border: 1px solid rgba(76, 175, 80, 0.2);
    }

    .granted-summary h4 {
      font-size: var(--font-size-sm, 14px);
      color: var(--color-success, #4caf50);
      margin: 0 0 var(--spacing-sm, 8px);
    }

    .granted-tags {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-xs, 4px);
    }

    .granted-tag {
      padding: 4px 10px;
      background: var(--color-background, #fff);
      border-radius: var(--radius-sm, 4px);
      font-size: var(--font-size-sm, 14px);
    }

    /* Compact grid for languages and simple selections */
    .proficiency-grid {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-xs, 4px);
    }

    .proficiency-chip {
      padding: 6px 12px;
      background: var(--color-background, #fff);
      border: 1px solid var(--color-border, #ddd);
      border-radius: 16px;
      cursor: pointer;
      font-size: var(--font-size-sm, 14px);
      transition: all 0.2s;
    }

    .proficiency-chip:hover:not(.disabled):not(.granted) {
      border-color: var(--color-primary-light, #7986cb);
    }

    .proficiency-chip.selected {
      background: var(--color-primary, #5c6bc0);
      border-color: var(--color-primary, #5c6bc0);
      color: white;
    }

    .proficiency-chip.granted {
      background: rgba(76, 175, 80, 0.2);
      border-color: var(--color-success, #4caf50);
    }

    .proficiency-chip.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: var(--spacing-md, 12px);
      color: var(--color-text-secondary, #666);
      font-style: italic;
    }
  `;

  @property({ type: Array }) sources: ProficiencySource[] = [];
  @property({ type: Object }) selectedProficiencies: Record<string, string[]> = {};

  /**
   * Get all granted proficiencies from all sources
   */
  private getGrantedProficiencies(type: ProficiencyType): Set<string> {
    const granted = new Set<string>();
    for (const source of this.sources) {
      if (source.granted) {
        const items = this.getGrantedByType(source.granted, type);
        items.forEach(item => granted.add(item.toLowerCase()));
      }
    }
    return granted;
  }

  private getGrantedByType(granted: GrantedProficiencies, type: ProficiencyType): string[] {
    switch (type) {
      case 'skill':
        return granted.skills ?? [];
      case 'tool':
        return granted.tools ?? [];
      case 'weapon':
        return granted.weapons ?? [];
      case 'armor':
        return granted.armor ?? [];
      default:
        return [];
    }
  }

  /**
   * Handle toggling a proficiency selection
   */
  private handleProficiencyToggle(
    sourceId: string,
    proficiencyType: ProficiencyType,
    optionId: string,
    maxSelections: number
  ) {
    const key = `${sourceId}-${proficiencyType}`;
    const current = this.selectedProficiencies[key] ?? [];
    const isSelected = current.includes(optionId);

    let newSelections: string[];
    if (isSelected) {
      newSelections = current.filter(id => id !== optionId);
    } else if (current.length < maxSelections) {
      newSelections = [...current, optionId];
    } else {
      return; // At max
    }

    this.dispatchEvent(new CustomEvent('selection-change', {
      detail: {
        sourceId,
        proficiencyType,
        key,
        selectedIds: newSelections,
        validation: {
          isValid: newSelections.length >= maxSelections,
          errors: newSelections.length < maxSelections
            ? [`Select ${maxSelections - newSelections.length} more`]
            : [],
          selectionsNeeded: Math.max(0, maxSelections - newSelections.length),
          selectionsRemaining: maxSelections - newSelections.length,
        },
      },
      bubbles: true,
      composed: true,
    }));
  }

  /**
   * Render a skill selection item
   */
  private renderSkillItem(
    skill: SkillData,
    sourceId: string,
    isAvailable: boolean,
    isSelected: boolean,
    isGranted: boolean,
    grantedSource: string | null,
    canSelect: boolean
  ) {
    const classes = [
      'proficiency-item',
      isSelected ? 'selected' : '',
      !canSelect && !isSelected && !isGranted ? 'disabled' : '',
      isGranted ? 'granted' : '',
      isGranted && grantedSource !== sourceId ? 'conflict' : '',
    ].filter(Boolean).join(' ');

    return html`
      <label class=${classes}>
        ${!isGranted ? html`
          <input
            type="checkbox"
            class="proficiency-checkbox"
            .checked=${isSelected}
            .disabled=${!isAvailable || (!canSelect && !isSelected)}
            @change=${() => this.handleProficiencyToggle(sourceId, 'skill', skill.id, 1)}
          />
        ` : ''}
        <div class="proficiency-info">
          <span class="proficiency-name">${skill.name}</span>
          <span class="proficiency-detail">(${skill.ability})</span>
        </div>
        ${isGranted ? html`
          <span class="proficiency-badge granted">${grantedSource ?? 'Granted'}</span>
        ` : ''}
      </label>
    `;
  }

  /**
   * Render skill choices for a source
   */
  private renderSkillChoices(source: ProficiencySource) {
    const choice = source.choices?.skills;
    if (!choice) return null;

    const key = `${source.id}-skill`;
    const selected = this.selectedProficiencies[key] ?? [];
    const grantedSkills = this.getGrantedProficiencies('skill');

    // Filter available options
    const availableOptions = choice.options
      .map(opt => opt.toLowerCase().replace(/ /g, ''))
      .filter(opt => SKILL_NAMES.includes(opt as SkillName));

    const count = choice.count;
    const selectedCount = selected.length;
    const isValid = selectedCount >= count;

    return html`
      <div class="proficiency-type-section">
        <div class="source-header">
          <span class="type-header">Skill Proficiencies</span>
          <span class="selection-status ${isValid ? 'valid' : 'invalid'}">
            ${selectedCount}/${count} selected
          </span>
        </div>
        <div class="proficiency-list">
          ${availableOptions.map(optionId => {
            const skillData = SKILL_DATA.find(s => s.id === optionId);
            if (!skillData) return null;

            const isSelected = selected.includes(optionId);
            const isGranted = grantedSkills.has(optionId);
            const canSelect = isSelected || selectedCount < count;

            return this.renderSkillItem(
              skillData,
              source.id,
              !isGranted,
              isSelected,
              isGranted,
              isGranted ? this.findGrantSource(optionId, 'skill') : null,
              canSelect
            );
          })}
        </div>
      </div>
    `;
  }

  /**
   * Find which source granted a proficiency
   */
  private findGrantSource(proficiencyId: string, type: ProficiencyType): string | null {
    const normalized = proficiencyId.toLowerCase();
    for (const source of this.sources) {
      if (source.granted) {
        const items = this.getGrantedByType(source.granted, type);
        if (items.some(item => item.toLowerCase() === normalized)) {
          return source.name;
        }
      }
    }
    return null;
  }

  /**
   * Render tool/language/other choices as chips
   */
  private renderChipChoices(
    source: ProficiencySource,
    type: ProficiencyType,
    choice: ProficiencyChoice | undefined,
    title: string
  ) {
    if (!choice) return null;

    const key = `${source.id}-${type}`;
    const selected = this.selectedProficiencies[key] ?? [];
    const granted = this.getGrantedProficiencies(type);

    const count = choice.count;
    const selectedCount = selected.length;
    const isValid = selectedCount >= count;

    return html`
      <div class="proficiency-type-section">
        <div class="source-header">
          <span class="type-header">${title}</span>
          <span class="selection-status ${isValid ? 'valid' : 'invalid'}">
            ${selectedCount}/${count} selected
          </span>
        </div>
        <div class="proficiency-grid">
          ${choice.options.map(option => {
            const optionId = option.toLowerCase();
            const isSelected = selected.includes(optionId);
            const isGranted = granted.has(optionId);
            const canSelect = isSelected || selectedCount < count;

            const classes = [
              'proficiency-chip',
              isSelected ? 'selected' : '',
              isGranted ? 'granted' : '',
              !canSelect && !isSelected && !isGranted ? 'disabled' : '',
            ].filter(Boolean).join(' ');

            return html`
              <button
                class=${classes}
                ?disabled=${isGranted || (!canSelect && !isSelected)}
                @click=${() => !isGranted && this.handleProficiencyToggle(source.id, type, optionId, count)}
              >${option}</button>
            `;
          })}
        </div>
      </div>
    `;
  }

  /**
   * Render granted proficiencies summary for a source
   */
  private renderGrantedSummary(source: ProficiencySource) {
    if (!source.granted) return null;

    const allGranted: Array<{ type: string; items: string[] }> = [];

    if (source.granted.skills?.length) {
      allGranted.push({ type: 'Skills', items: source.granted.skills });
    }
    if (source.granted.tools?.length) {
      allGranted.push({ type: 'Tools', items: source.granted.tools });
    }
    if (source.granted.weapons?.length) {
      allGranted.push({ type: 'Weapons', items: source.granted.weapons });
    }
    if (source.granted.armor?.length) {
      allGranted.push({ type: 'Armor', items: source.granted.armor });
    }

    if (allGranted.length === 0) return null;

    return html`
      <div class="granted-summary">
        <h4>Automatically Granted</h4>
        ${allGranted.map(group => html`
          <div style="margin-bottom: var(--spacing-xs, 4px);">
            <strong style="font-size: 12px; color: var(--color-text-secondary);">${group.type}:</strong>
            <div class="granted-tags">
              ${group.items.map(item => html`
                <span class="granted-tag">${item}</span>
              `)}
            </div>
          </div>
        `)}
      </div>
    `;
  }

  /**
   * Render a single source's proficiency options
   */
  private renderSource(source: ProficiencySource) {
    const hasChoices = source.choices &&
      (source.choices.skills || source.choices.tools ||
       source.choices.weapons || source.choices.languages);
    const hasGranted = source.granted &&
      (source.granted.skills?.length || source.granted.tools?.length ||
       source.granted.weapons?.length || source.granted.armor?.length);

    if (!hasChoices && !hasGranted) return null;

    return html`
      <div class="source-section">
        <div class="source-header">
          <h3 class="source-title">
            ${source.name}
            <span class="source-badge ${source.type}">${source.type}</span>
          </h3>
        </div>

        ${this.renderSkillChoices(source)}
        ${this.renderChipChoices(source, 'tool', source.choices?.tools, 'Tool Proficiencies')}
        ${this.renderChipChoices(source, 'weapon', source.choices?.weapons, 'Weapon Proficiencies')}
        ${this.renderChipChoices(source, 'language', source.choices?.languages, 'Languages')}
        ${this.renderGrantedSummary(source)}
      </div>
    `;
  }

  render() {
    if (this.sources.length === 0) {
      return html`
        <div class="empty-state">
          No proficiency sources available. Select a class, race, and background first.
        </div>
      `;
    }

    return html`
      <div class="proficiency-resolver">
        ${this.sources.map(source => this.renderSource(source))}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'proficiency-choice-resolver': ProficiencyChoiceResolver;
  }
}
