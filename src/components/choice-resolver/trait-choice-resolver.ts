import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { FeatureChoice } from '../../types/module.ts';
import './choice-resolver.ts';

/**
 * Trait source - represents where a trait choice comes from
 */
export interface TraitSource {
  /** Source type (class, subclass, race, feat) */
  type: 'class' | 'subclass' | 'race' | 'subrace' | 'feat' | 'background';
  /** Source ID */
  id: string;
  /** Source name */
  name: string;
  /** Color for visual distinction */
  color?: string;
}

/**
 * Trait choice with source information
 */
export interface TraitChoiceWithSource {
  /** Feature ID containing this choice */
  featureId: string;
  /** Feature name */
  featureName: string;
  /** Level requirement */
  level: number;
  /** The choice configuration */
  choice: FeatureChoice;
  /** Source of this trait */
  source: TraitSource;
  /** Currently selected options */
  selectedOptions: string[];
}

/**
 * Specialized trait/feature choice resolver component
 *
 * Handles optional trait selections from class features, racial traits, etc.
 * Groups choices by source and level, with visual distinction.
 *
 * @fires selection-change - When trait selection changes
 */
@customElement('trait-choice-resolver')
export class TraitChoiceResolver extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .trait-resolver {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg, 16px);
    }

    /* Source section */
    .source-section {
      background: var(--color-surface, #f5f5f5);
      border-radius: var(--radius-md, 8px);
      overflow: hidden;
    }

    .source-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm, 8px);
      padding: var(--spacing-md, 12px) var(--spacing-lg, 16px);
      background: var(--color-background, #fff);
      border-bottom: 1px solid var(--color-border, #ddd);
    }

    .source-indicator {
      width: 4px;
      height: 24px;
      border-radius: 2px;
    }

    .source-indicator.class {
      background: var(--color-primary, #5c6bc0);
    }

    .source-indicator.subclass {
      background: #7e57c2;
    }

    .source-indicator.race {
      background: var(--color-success, #4caf50);
    }

    .source-indicator.subrace {
      background: #66bb6a;
    }

    .source-indicator.feat {
      background: var(--color-warning, #ff9800);
    }

    .source-indicator.background {
      background: #26a69a;
    }

    .source-title {
      flex: 1;
      font-size: var(--font-size-md, 16px);
      font-weight: 600;
      margin: 0;
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

    .source-badge.subclass {
      background: rgba(126, 87, 194, 0.2);
      color: #7e57c2;
    }

    .source-badge.race {
      background: rgba(76, 175, 80, 0.2);
      color: var(--color-success, #4caf50);
    }

    .source-badge.feat {
      background: rgba(255, 152, 0, 0.2);
      color: var(--color-warning, #ff9800);
    }

    .source-content {
      padding: var(--spacing-lg, 16px);
    }

    /* Feature section */
    .feature-section {
      margin-bottom: var(--spacing-lg, 16px);
    }

    .feature-section:last-child {
      margin-bottom: 0;
    }

    .feature-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-md, 12px);
    }

    .feature-title {
      font-size: var(--font-size-md, 16px);
      font-weight: 600;
      margin: 0;
    }

    .feature-level {
      font-size: var(--font-size-sm, 14px);
      color: var(--color-text-secondary, #666);
    }

    .feature-description {
      font-size: var(--font-size-sm, 14px);
      color: var(--color-text-secondary, #666);
      margin-bottom: var(--spacing-md, 12px);
    }

    .selection-status {
      font-size: var(--font-size-sm, 14px);
      padding: 4px 10px;
      border-radius: var(--radius-sm, 4px);
      background: var(--color-background, #fff);
    }

    .selection-status.valid {
      color: var(--color-success, #4caf50);
    }

    .selection-status.invalid {
      color: var(--color-danger, #f44336);
    }

    /* Trait options */
    .trait-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: var(--spacing-md, 12px);
    }

    .trait-card {
      padding: var(--spacing-md, 12px);
      background: var(--color-background, #fff);
      border: 2px solid var(--color-border, #ddd);
      border-radius: var(--radius-md, 8px);
      cursor: pointer;
      transition: all 0.2s;
    }

    .trait-card:hover:not(.disabled) {
      border-color: var(--color-primary-light, #7986cb);
    }

    .trait-card.selected {
      border-color: var(--color-primary, #5c6bc0);
      background: rgba(92, 107, 192, 0.05);
    }

    .trait-card.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .trait-card-header {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-sm, 8px);
      margin-bottom: var(--spacing-sm, 8px);
    }

    .trait-checkbox {
      margin-top: 2px;
    }

    .trait-checkbox input {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .trait-name {
      flex: 1;
      font-weight: 600;
      font-size: var(--font-size-md, 16px);
    }

    .trait-type {
      font-size: 10px;
      padding: 2px 6px;
      background: var(--color-surface, #f5f5f5);
      border-radius: var(--radius-sm, 4px);
      text-transform: capitalize;
    }

    .trait-description {
      font-size: var(--font-size-sm, 14px);
      color: var(--color-text-secondary, #666);
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .trait-prerequisites {
      font-size: 12px;
      color: var(--color-warning, #ff9800);
      margin-top: var(--spacing-sm, 8px);
      padding: 4px 8px;
      background: rgba(255, 152, 0, 0.1);
      border-radius: var(--radius-sm, 4px);
    }

    /* Selected summary */
    .selected-summary {
      background: rgba(92, 107, 192, 0.05);
      border-radius: var(--radius-md, 8px);
      padding: var(--spacing-lg, 16px);
    }

    .summary-title {
      font-size: var(--font-size-lg, 18px);
      font-weight: 600;
      margin: 0 0 var(--spacing-md, 12px);
    }

    .summary-list {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-sm, 8px);
    }

    .summary-chip {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs, 4px);
      padding: 6px 12px;
      background: var(--color-background, #fff);
      border-radius: var(--radius-sm, 4px);
      font-size: var(--font-size-sm, 14px);
    }

    .summary-chip .source-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .summary-chip .source-dot.class {
      background: var(--color-primary, #5c6bc0);
    }

    .summary-chip .source-dot.subclass {
      background: #7e57c2;
    }

    .summary-chip .source-dot.race {
      background: var(--color-success, #4caf50);
    }

    .summary-chip .remove-btn {
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
      margin-left: 4px;
    }

    .summary-chip .remove-btn:hover {
      background: var(--color-danger, #f44336);
      color: white;
    }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: var(--spacing-xl, 24px);
      color: var(--color-text-secondary, #666);
    }
  `;

  @property({ type: Array }) traitChoices: TraitChoiceWithSource[] = [];

  /**
   * Group choices by source
   */
  private get choicesBySource(): Map<string, TraitChoiceWithSource[]> {
    const groups = new Map<string, TraitChoiceWithSource[]>();

    for (const choice of this.traitChoices) {
      const key = `${choice.source.type}-${choice.source.id}`;
      const existing = groups.get(key) ?? [];
      groups.set(key, [...existing, choice]);
    }

    return groups;
  }

  /**
   * Get all selected options across all choices
   */
  private get allSelectedOptions(): Array<{
    featureId: string;
    featureName: string;
    optionId: string;
    optionName: string;
    source: TraitSource;
  }> {
    const selected: Array<{
      featureId: string;
      featureName: string;
      optionId: string;
      optionName: string;
      source: TraitSource;
    }> = [];

    for (const choice of this.traitChoices) {
      for (const optionId of choice.selectedOptions) {
        const optionName = choice.choice.options.find(o =>
          o.toLowerCase() === optionId.toLowerCase() || o === optionId
        ) ?? optionId;
        selected.push({
          featureId: choice.featureId,
          featureName: choice.featureName,
          optionId,
          optionName,
          source: choice.source,
        });
      }
    }

    return selected;
  }

  private handleTraitToggle(
    featureId: string,
    choiceId: string,
    optionId: string,
    maxCount: number
  ) {
    const choice = this.traitChoices.find(c => c.featureId === featureId && c.choice.id === choiceId);
    if (!choice) return;

    const current = choice.selectedOptions;
    const isSelected = current.includes(optionId);

    let newSelections: string[];
    if (isSelected) {
      newSelections = current.filter(id => id !== optionId);
    } else if (current.length < maxCount) {
      newSelections = [...current, optionId];
    } else {
      return; // At max
    }

    this.dispatchEvent(new CustomEvent('selection-change', {
      detail: {
        featureId,
        choiceId,
        selectedOptions: newSelections,
        validation: {
          isValid: newSelections.length === maxCount,
          errors: newSelections.length < maxCount
            ? [`Select ${maxCount - newSelections.length} more`]
            : [],
          selectionsNeeded: Math.max(0, maxCount - newSelections.length),
          selectionsRemaining: maxCount - newSelections.length,
        },
      },
      bubbles: true,
      composed: true,
    }));
  }

  private handleRemoveSelection(featureId: string, choiceId: string, optionId: string) {
    const choice = this.traitChoices.find(c => c.featureId === featureId && c.choice.id === choiceId);
    if (!choice) return;

    const newSelections = choice.selectedOptions.filter(id => id !== optionId);

    this.dispatchEvent(new CustomEvent('selection-change', {
      detail: {
        featureId,
        choiceId,
        selectedOptions: newSelections,
      },
      bubbles: true,
      composed: true,
    }));
  }

  private renderTraitCard(
    option: string,
    featureId: string,
    choice: FeatureChoice,
    selectedOptions: string[],
    maxCount: number
  ) {
    const optionId = option.toLowerCase();
    const isSelected = selectedOptions.includes(optionId) ||
      selectedOptions.includes(option);
    const canSelect = isSelected || selectedOptions.length < maxCount;

    const classes = [
      'trait-card',
      isSelected ? 'selected' : '',
      !canSelect ? 'disabled' : '',
    ].filter(Boolean).join(' ');

    return html`
      <div
        class=${classes}
        @click=${() => canSelect || isSelected ? this.handleTraitToggle(featureId, choice.id, optionId, maxCount) : null}
      >
        <div class="trait-card-header">
          <div class="trait-checkbox">
            <input
              type="checkbox"
              .checked=${isSelected}
              .disabled=${!canSelect && !isSelected}
              @click=${(e: Event) => e.stopPropagation()}
              @change=${() => this.handleTraitToggle(featureId, choice.id, optionId, maxCount)}
            />
          </div>
          <span class="trait-name">${option}</span>
          <span class="trait-type">${choice.type}</span>
        </div>
        ${choice.description ? html`
          <div class="trait-description">${choice.description}</div>
        ` : ''}
      </div>
    `;
  }

  private renderFeatureChoice(choice: TraitChoiceWithSource) {
    const { count, options } = choice.choice;
    const selectedCount = choice.selectedOptions.length;
    const isValid = selectedCount >= count;

    return html`
      <div class="feature-section">
        <div class="feature-header">
          <div>
            <h4 class="feature-title">${choice.featureName}</h4>
            ${choice.level > 1 ? html`
              <span class="feature-level">Level ${choice.level}</span>
            ` : ''}
          </div>
          <span class="selection-status ${isValid ? 'valid' : 'invalid'}">
            ${selectedCount}/${count} selected
          </span>
        </div>

        ${choice.choice.description ? html`
          <p class="feature-description">${choice.choice.description}</p>
        ` : ''}

        <div class="trait-grid">
          ${options.map(option => this.renderTraitCard(
            option,
            choice.featureId,
            choice.choice,
            choice.selectedOptions,
            count
          ))}
        </div>
      </div>
    `;
  }

  private renderSourceSection(_sourceKey: string, choices: TraitChoiceWithSource[]) {
    const source = choices[0].source;

    return html`
      <div class="source-section">
        <div class="source-header">
          <div class="source-indicator ${source.type}"></div>
          <h3 class="source-title">${source.name}</h3>
          <span class="source-badge ${source.type}">${source.type}</span>
        </div>
        <div class="source-content">
          ${choices
            .sort((a, b) => a.level - b.level)
            .map(choice => this.renderFeatureChoice(choice))}
        </div>
      </div>
    `;
  }

  private renderSelectedSummary() {
    const selected = this.allSelectedOptions;
    if (selected.length === 0) return null;

    return html`
      <div class="selected-summary">
        <h3 class="summary-title">Selected Traits</h3>
        <div class="summary-list">
          ${selected.map(item => html`
            <span class="summary-chip">
              <span class="source-dot ${item.source.type}"></span>
              ${item.optionName}
              <button
                class="remove-btn"
                @click=${() => {
                  const choice = this.traitChoices.find(c =>
                    c.featureId === item.featureId &&
                    c.selectedOptions.includes(item.optionId)
                  );
                  if (choice) {
                    this.handleRemoveSelection(item.featureId, choice.choice.id, item.optionId);
                  }
                }}
              >×</button>
            </span>
          `)}
        </div>
      </div>
    `;
  }

  render() {
    if (this.traitChoices.length === 0) {
      return html`
        <div class="empty-state">
          No optional traits available. Select your class, race, and reach the appropriate level
          to unlock trait choices.
        </div>
      `;
    }

    const sourceGroups = this.choicesBySource;

    return html`
      <div class="trait-resolver">
        ${this.renderSelectedSummary()}

        ${Array.from(sourceGroups.entries()).map(([key, choices]) =>
          this.renderSourceSection(key, choices)
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'trait-choice-resolver': TraitChoiceResolver;
  }
}
