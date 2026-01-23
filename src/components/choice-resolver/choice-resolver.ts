import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type {
  ChoiceConfig,
  ChoiceOption,
  ChoiceValidation,
  ChoiceSelectionEvent,
} from './choice-resolver-types.ts';
import { validateChoice, filterOptions, groupOptionsByCategory } from './choice-resolver-types.ts';

/**
 * Generic choice resolver component
 *
 * Handles selection of options with validation, search, and flexible UI modes.
 *
 * @fires selection-change - When selection changes
 *
 * @example
 * ```html
 * <choice-resolver
 *   .config=${skillChoiceConfig}
 *   @selection-change=${this.handleSkillChange}
 * ></choice-resolver>
 * ```
 */
@customElement('choice-resolver')
export class ChoiceResolver<T = unknown> extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .choice-container {
      background: var(--color-surface, #f5f5f5);
      border-radius: var(--radius-md, 8px);
      padding: var(--spacing-lg, 16px);
    }

    .choice-header {
      margin-bottom: var(--spacing-md, 12px);
    }

    .choice-title {
      font-size: var(--font-size-lg, 18px);
      font-weight: 600;
      margin: 0 0 var(--spacing-xs, 4px);
      color: var(--color-text-primary, #1a1a1a);
    }

    .choice-description {
      font-size: var(--font-size-sm, 14px);
      color: var(--color-text-secondary, #666);
      margin: 0;
    }

    .choice-status {
      display: flex;
      align-items: center;
      gap: var(--spacing-md, 12px);
      margin-top: var(--spacing-sm, 8px);
    }

    .selection-count {
      font-size: var(--font-size-sm, 14px);
      padding: 4px 12px;
      border-radius: var(--radius-sm, 4px);
      background: var(--color-background, #fff);
    }

    .selection-count.valid {
      color: var(--color-success, #4caf50);
    }

    .selection-count.invalid {
      color: var(--color-danger, #f44336);
    }

    .selection-count.warning {
      color: var(--color-warning, #ff9800);
    }

    .error-message {
      font-size: var(--font-size-sm, 14px);
      color: var(--color-danger, #f44336);
    }

    /* Search */
    .search-container {
      margin-bottom: var(--spacing-md, 12px);
    }

    .search-input {
      width: 100%;
      padding: var(--spacing-sm, 8px) var(--spacing-md, 12px);
      border: 1px solid var(--color-border, #ddd);
      border-radius: var(--radius-sm, 4px);
      font-size: var(--font-size-md, 16px);
      background: var(--color-background, #fff);
      box-sizing: border-box;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--color-primary, #5c6bc0);
      box-shadow: 0 0 0 2px rgba(92, 107, 192, 0.2);
    }

    /* Category filters */
    .category-filters {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-xs, 4px);
      margin-bottom: var(--spacing-md, 12px);
    }

    .category-filter {
      padding: 4px 12px;
      border: 1px solid var(--color-border, #ddd);
      border-radius: var(--radius-sm, 4px);
      background: var(--color-background, #fff);
      font-size: var(--font-size-sm, 14px);
      cursor: pointer;
      transition: all 0.2s;
    }

    .category-filter:hover {
      border-color: var(--color-primary-light, #7986cb);
    }

    .category-filter.active {
      background: var(--color-primary, #5c6bc0);
      border-color: var(--color-primary, #5c6bc0);
      color: white;
    }

    /* Options list display */
    .options-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs, 4px);
      max-height: 400px;
      overflow-y: auto;
    }

    /* Options grid display */
    .options-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: var(--spacing-md, 12px);
      max-height: 500px;
      overflow-y: auto;
    }

    /* Options compact display */
    .options-compact {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-xs, 4px);
    }

    /* Category group */
    .category-group {
      margin-bottom: var(--spacing-md, 12px);
    }

    .category-label {
      font-size: var(--font-size-sm, 14px);
      font-weight: 600;
      color: var(--color-text-secondary, #666);
      margin-bottom: var(--spacing-xs, 4px);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Option item (list mode) */
    .option-item {
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

    .option-item:hover:not(.disabled):not(.granted) {
      border-color: var(--color-primary-light, #7986cb);
      background: rgba(92, 107, 192, 0.05);
    }

    .option-item.selected {
      border-color: var(--color-primary, #5c6bc0);
      background: rgba(92, 107, 192, 0.1);
    }

    .option-item.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .option-item.granted {
      opacity: 0.7;
      background: rgba(76, 175, 80, 0.1);
      border-color: var(--color-success, #4caf50);
      cursor: default;
    }

    .option-checkbox {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }

    .option-info {
      flex: 1;
      min-width: 0;
    }

    .option-name {
      font-weight: 500;
      color: var(--color-text-primary, #1a1a1a);
    }

    .option-description {
      font-size: var(--font-size-sm, 14px);
      color: var(--color-text-secondary, #666);
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .option-tags {
      display: flex;
      gap: 4px;
      margin-top: 4px;
    }

    .option-tag {
      font-size: 11px;
      padding: 2px 6px;
      background: var(--color-surface, #f5f5f5);
      border-radius: var(--radius-sm, 4px);
    }

    .granted-badge {
      font-size: 11px;
      padding: 2px 6px;
      background: rgba(76, 175, 80, 0.2);
      color: var(--color-success, #4caf50);
      border-radius: var(--radius-sm, 4px);
    }

    /* Option card (grid mode) */
    .option-card {
      padding: var(--spacing-md, 12px);
      background: var(--color-background, #fff);
      border: 2px solid var(--color-border, #ddd);
      border-radius: var(--radius-md, 8px);
      cursor: pointer;
      transition: all 0.2s;
    }

    .option-card:hover:not(.disabled):not(.granted) {
      border-color: var(--color-primary-light, #7986cb);
      transform: translateY(-1px);
    }

    .option-card.selected {
      border-color: var(--color-primary, #5c6bc0);
      background: rgba(92, 107, 192, 0.1);
    }

    .option-card.disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .option-card.granted {
      opacity: 0.7;
      background: rgba(76, 175, 80, 0.1);
      border-color: var(--color-success, #4caf50);
      cursor: default;
    }

    .option-card .option-name {
      font-size: var(--font-size-md, 16px);
      margin-bottom: var(--spacing-xs, 4px);
    }

    .option-card .option-description {
      white-space: normal;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Option chip (compact mode) */
    .option-chip {
      padding: 6px 12px;
      background: var(--color-background, #fff);
      border: 1px solid var(--color-border, #ddd);
      border-radius: 16px;
      cursor: pointer;
      font-size: var(--font-size-sm, 14px);
      transition: all 0.2s;
    }

    .option-chip:hover:not(.disabled):not(.granted) {
      border-color: var(--color-primary-light, #7986cb);
    }

    .option-chip.selected {
      background: var(--color-primary, #5c6bc0);
      border-color: var(--color-primary, #5c6bc0);
      color: white;
    }

    .option-chip.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .option-chip.granted {
      background: rgba(76, 175, 80, 0.2);
      border-color: var(--color-success, #4caf50);
      cursor: default;
    }

    /* Granted section */
    .granted-section {
      margin-top: var(--spacing-lg, 16px);
      padding-top: var(--spacing-md, 12px);
      border-top: 1px solid var(--color-border, #ddd);
    }

    .granted-section h4 {
      font-size: var(--font-size-sm, 14px);
      color: var(--color-text-secondary, #666);
      margin: 0 0 var(--spacing-sm, 8px);
    }

    /* Clear button */
    .clear-button {
      padding: 4px 12px;
      background: transparent;
      border: 1px solid var(--color-border, #ddd);
      border-radius: var(--radius-sm, 4px);
      font-size: var(--font-size-sm, 14px);
      cursor: pointer;
      color: var(--color-text-secondary, #666);
      transition: all 0.2s;
    }

    .clear-button:hover {
      background: var(--color-background, #fff);
      color: var(--color-danger, #f44336);
      border-color: var(--color-danger, #f44336);
    }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: var(--spacing-xl, 24px);
      color: var(--color-text-secondary, #666);
    }

    /* Scrollbar styling */
    .options-list::-webkit-scrollbar,
    .options-grid::-webkit-scrollbar {
      width: 8px;
    }

    .options-list::-webkit-scrollbar-track,
    .options-grid::-webkit-scrollbar-track {
      background: var(--color-surface, #f5f5f5);
      border-radius: 4px;
    }

    .options-list::-webkit-scrollbar-thumb,
    .options-grid::-webkit-scrollbar-thumb {
      background: var(--color-border, #ddd);
      border-radius: 4px;
    }

    .options-list::-webkit-scrollbar-thumb:hover,
    .options-grid::-webkit-scrollbar-thumb:hover {
      background: var(--color-text-secondary, #666);
    }
  `;

  @property({ type: Object })
  config!: ChoiceConfig<T>;

  @state()
  private searchQuery = '';

  @state()
  private activeCategory: string | null = null;

  private get validation(): ChoiceValidation {
    return validateChoice(this.config);
  }

  private get filteredOptions(): ChoiceOption<T>[] {
    const { options, showGranted } = this.config;
    let filtered = showGranted === false
      ? options.filter(o => !o.granted)
      : options;

    return filterOptions(filtered, this.searchQuery, this.activeCategory ?? undefined);
  }

  private get grantedOptions(): ChoiceOption<T>[] {
    return this.config.options.filter(o => o.granted);
  }

  private handleSearchInput(e: Event) {
    this.searchQuery = (e.target as HTMLInputElement).value;
  }

  private handleCategoryFilter(category: string | null) {
    this.activeCategory = this.activeCategory === category ? null : category;
  }

  private handleOptionToggle(option: ChoiceOption<T>) {
    if (option.disabled || option.granted) return;

    const { mode, selectedIds, maxSelections } = this.config;
    const effectiveMax = maxSelections ?? (mode === 'single' ? 1 : Infinity);
    const isSelected = selectedIds.includes(option.id);

    let newSelectedIds: string[];

    if (mode === 'single') {
      // Single mode: replace selection
      newSelectedIds = isSelected ? [] : [option.id];
    } else {
      // Multi mode: toggle selection
      if (isSelected) {
        newSelectedIds = selectedIds.filter(id => id !== option.id);
      } else if (selectedIds.length < effectiveMax) {
        newSelectedIds = [...selectedIds, option.id];
      } else {
        // At max, don't add
        return;
      }
    }

    this.dispatchSelectionChange(newSelectedIds, isSelected ? undefined : option, isSelected ? option : undefined);
  }

  private handleClearAll() {
    // Keep granted selections
    const grantedIds = this.config.options.filter(o => o.granted).map(o => o.id);
    const newSelectedIds = this.config.selectedIds.filter(id => grantedIds.includes(id));
    this.dispatchSelectionChange(newSelectedIds);
  }

  private dispatchSelectionChange(
    newSelectedIds: string[],
    added?: ChoiceOption<T>,
    removed?: ChoiceOption<T>
  ) {
    const newConfig = { ...this.config, selectedIds: newSelectedIds };
    const event: ChoiceSelectionEvent<T> = {
      choiceId: this.config.id,
      selectedIds: newSelectedIds,
      added,
      removed,
      validation: validateChoice(newConfig),
    };

    this.dispatchEvent(new CustomEvent('selection-change', {
      detail: event,
      bubbles: true,
      composed: true,
    }));
  }

  private renderHeader() {
    const { title, description, allowClear, selectedIds } = this.config;
    const { errors, selectionsNeeded, selectionsRemaining } = this.validation;
    const { minSelections = 0, maxSelections } = this.config;
    const effectiveMax = maxSelections ?? (this.config.mode === 'single' ? 1 : Infinity);

    const selectedCount = selectedIds.length;
    const grantedCount = this.grantedOptions.length;
    const userSelections = selectedCount - grantedCount;

    let statusClass = 'valid';
    if (selectionsNeeded > 0) {
      statusClass = 'invalid';
    } else if (selectionsRemaining === 0 && effectiveMax !== Infinity) {
      statusClass = 'warning';
    }

    const showClear = allowClear && userSelections > 0;

    return html`
      <div class="choice-header">
        <h3 class="choice-title">${title}</h3>
        ${description ? html`<p class="choice-description">${description}</p>` : ''}
        <div class="choice-status">
          <span class="selection-count ${statusClass}">
            ${minSelections > 0 || effectiveMax !== Infinity
              ? `${selectedCount}/${effectiveMax === Infinity ? minSelections + '+' : effectiveMax} selected`
              : `${selectedCount} selected`}
          </span>
          ${errors.length > 0 ? html`
            <span class="error-message">${errors[0]}</span>
          ` : ''}
          ${showClear ? html`
            <button class="clear-button" @click=${this.handleClearAll}>Clear</button>
          ` : ''}
        </div>
      </div>
    `;
  }

  private renderSearch() {
    const { searchable, searchPlaceholder } = this.config;
    if (!searchable) return null;

    return html`
      <div class="search-container">
        <input
          type="text"
          class="search-input"
          placeholder=${searchPlaceholder ?? 'Search...'}
          .value=${this.searchQuery}
          @input=${this.handleSearchInput}
        />
      </div>
    `;
  }

  private renderCategoryFilters() {
    const { categoryFilters } = this.config;
    if (!categoryFilters || categoryFilters.length === 0) return null;

    return html`
      <div class="category-filters">
        <button
          class="category-filter ${this.activeCategory === null ? 'active' : ''}"
          @click=${() => this.handleCategoryFilter(null)}
        >All</button>
        ${categoryFilters.map(category => html`
          <button
            class="category-filter ${this.activeCategory === category ? 'active' : ''}"
            @click=${() => this.handleCategoryFilter(category)}
          >${category}</button>
        `)}
      </div>
    `;
  }

  private renderOptionItem(option: ChoiceOption<T>) {
    const isSelected = this.config.selectedIds.includes(option.id);
    const { mode, selectedIds, maxSelections } = this.config;
    const effectiveMax = maxSelections ?? (mode === 'single' ? 1 : Infinity);
    const canSelect = isSelected || selectedIds.length < effectiveMax;

    const classes = [
      'option-item',
      isSelected ? 'selected' : '',
      option.disabled ? 'disabled' : '',
      option.granted ? 'granted' : '',
      !canSelect && !option.granted ? 'disabled' : '',
    ].filter(Boolean).join(' ');

    return html`
      <div class=${classes} @click=${() => this.handleOptionToggle(option)}>
        ${mode === 'multi' && !option.granted ? html`
          <input
            type="checkbox"
            class="option-checkbox"
            .checked=${isSelected}
            .disabled=${option.disabled || (!canSelect && !isSelected)}
            @click=${(e: Event) => e.stopPropagation()}
            @change=${() => this.handleOptionToggle(option)}
          />
        ` : ''}
        <div class="option-info">
          <div class="option-name">${option.name}</div>
          ${option.description ? html`
            <div class="option-description">${option.description}</div>
          ` : ''}
          ${option.tags?.length ? html`
            <div class="option-tags">
              ${option.tags.map(tag => html`<span class="option-tag">${tag}</span>`)}
            </div>
          ` : ''}
        </div>
        ${option.granted ? html`
          <span class="granted-badge">${option.grantedSource ?? 'Granted'}</span>
        ` : ''}
      </div>
    `;
  }

  private renderOptionCard(option: ChoiceOption<T>) {
    const isSelected = this.config.selectedIds.includes(option.id);
    const { mode, selectedIds, maxSelections } = this.config;
    const effectiveMax = maxSelections ?? (mode === 'single' ? 1 : Infinity);
    const canSelect = isSelected || selectedIds.length < effectiveMax;

    const classes = [
      'option-card',
      isSelected ? 'selected' : '',
      option.disabled ? 'disabled' : '',
      option.granted ? 'granted' : '',
      !canSelect && !option.granted ? 'disabled' : '',
    ].filter(Boolean).join(' ');

    return html`
      <div class=${classes} @click=${() => this.handleOptionToggle(option)}>
        <div class="option-name">${option.name}</div>
        ${option.description ? html`
          <div class="option-description">${option.description}</div>
        ` : ''}
        ${option.tags?.length ? html`
          <div class="option-tags">
            ${option.tags.map(tag => html`<span class="option-tag">${tag}</span>`)}
          </div>
        ` : ''}
        ${option.granted ? html`
          <span class="granted-badge">${option.grantedSource ?? 'Granted'}</span>
        ` : ''}
      </div>
    `;
  }

  private renderOptionChip(option: ChoiceOption<T>) {
    const isSelected = this.config.selectedIds.includes(option.id);
    const { mode, selectedIds, maxSelections } = this.config;
    const effectiveMax = maxSelections ?? (mode === 'single' ? 1 : Infinity);
    const canSelect = isSelected || selectedIds.length < effectiveMax;

    const classes = [
      'option-chip',
      isSelected ? 'selected' : '',
      option.disabled ? 'disabled' : '',
      option.granted ? 'granted' : '',
      !canSelect && !option.granted ? 'disabled' : '',
    ].filter(Boolean).join(' ');

    return html`
      <button class=${classes} @click=${() => this.handleOptionToggle(option)}>
        ${option.name}
      </button>
    `;
  }

  private renderOptionsList() {
    const { displayMode = 'list' } = this.config;
    const options = this.filteredOptions.filter(o => !o.granted);

    if (options.length === 0) {
      return html`
        <div class="empty-state">
          ${this.searchQuery || this.activeCategory
            ? 'No options match your filters'
            : 'No options available'}
        </div>
      `;
    }

    // Group by category if categories exist
    const hasCategories = options.some(o => o.category);

    if (hasCategories && !this.activeCategory) {
      const groups = groupOptionsByCategory(options);

      return html`
        <div class="options-${displayMode === 'compact' ? 'compact' : displayMode}">
          ${Array.from(groups.entries()).map(([category, categoryOptions]) => html`
            <div class="category-group">
              <div class="category-label">${category}</div>
              ${displayMode === 'grid'
                ? categoryOptions.map(o => this.renderOptionCard(o))
                : displayMode === 'compact'
                ? categoryOptions.map(o => this.renderOptionChip(o))
                : categoryOptions.map(o => this.renderOptionItem(o))}
            </div>
          `)}
        </div>
      `;
    }

    // Render without groups
    if (displayMode === 'grid') {
      return html`
        <div class="options-grid">
          ${options.map(o => this.renderOptionCard(o))}
        </div>
      `;
    }

    if (displayMode === 'compact') {
      return html`
        <div class="options-compact">
          ${options.map(o => this.renderOptionChip(o))}
        </div>
      `;
    }

    return html`
      <div class="options-list">
        ${options.map(o => this.renderOptionItem(o))}
      </div>
    `;
  }

  private renderGrantedSection() {
    const { showGranted } = this.config;
    const grantedOptions = this.grantedOptions;

    if (showGranted === false || grantedOptions.length === 0) return null;

    return html`
      <div class="granted-section">
        <h4>Granted (automatic)</h4>
        <div class="options-compact">
          ${grantedOptions.map(o => this.renderOptionChip(o))}
        </div>
      </div>
    `;
  }

  render() {
    if (!this.config) {
      return html`<div class="empty-state">No configuration provided</div>`;
    }

    return html`
      <div class="choice-container">
        ${this.renderHeader()}
        ${this.renderSearch()}
        ${this.renderCategoryFilters()}
        ${this.renderOptionsList()}
        ${this.renderGrantedSection()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'choice-resolver': ChoiceResolver;
  }
}
