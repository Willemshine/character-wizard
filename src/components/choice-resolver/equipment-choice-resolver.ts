import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { ModuleEquipment } from '../../types/module.ts';
import { packLoader } from '../../services/pack-loader.ts';
import './choice-resolver.ts';

/**
 * Equipment choice group - represents a single choice with multiple options
 */
export interface EquipmentChoiceGroup {
  /** Unique ID for this choice group */
  id: string;
  /** Description of the choice (e.g., "Choose one:") */
  description?: string;
  /** The available options */
  options: EquipmentGroupOption[];
  /** Currently selected option index */
  selectedIndex: number | null;
}

/**
 * A single option within an equipment choice group
 */
export interface EquipmentGroupOption {
  /** Display label for this option */
  label: string;
  /** Items included in this option */
  items: EquipmentItem[];
}

/**
 * Equipment item with quantity
 */
export interface EquipmentItem {
  /** Item ID or name */
  itemId: string;
  /** Display name */
  name: string;
  /** Quantity */
  quantity: number;
  /** Item details (loaded from pack) */
  details?: ModuleEquipment;
}

/**
 * Specialized equipment choice resolver component
 *
 * Handles equipment selection groups (e.g., "Choose: (a) longsword or (b) any simple weapon")
 * with display of item details and totals.
 *
 * @fires selection-change - When equipment selection changes
 */
@customElement('equipment-choice-resolver')
export class EquipmentChoiceResolver extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .equipment-resolver {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg, 16px);
    }

    /* Choice group */
    .choice-group {
      background: var(--color-surface, #f5f5f5);
      border-radius: var(--radius-md, 8px);
      padding: var(--spacing-lg, 16px);
    }

    .choice-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-md, 12px);
    }

    .choice-title {
      font-size: var(--font-size-md, 16px);
      font-weight: 600;
      margin: 0;
      color: var(--color-text-primary, #1a1a1a);
    }

    .choice-status {
      font-size: var(--font-size-sm, 14px);
      padding: 4px 10px;
      border-radius: var(--radius-sm, 4px);
    }

    .choice-status.selected {
      background: rgba(76, 175, 80, 0.1);
      color: var(--color-success, #4caf50);
    }

    .choice-status.pending {
      background: rgba(255, 152, 0, 0.1);
      color: var(--color-warning, #ff9800);
    }

    /* Option card */
    .option-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm, 8px);
    }

    .option-card {
      display: flex;
      gap: var(--spacing-md, 12px);
      padding: var(--spacing-md, 12px);
      background: var(--color-background, #fff);
      border: 2px solid var(--color-border, #ddd);
      border-radius: var(--radius-md, 8px);
      cursor: pointer;
      transition: all 0.2s;
    }

    .option-card:hover {
      border-color: var(--color-primary-light, #7986cb);
    }

    .option-card.selected {
      border-color: var(--color-primary, #5c6bc0);
      background: rgba(92, 107, 192, 0.05);
    }

    .option-radio {
      display: flex;
      align-items: flex-start;
      padding-top: 2px;
    }

    .option-radio input {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .option-content {
      flex: 1;
      min-width: 0;
    }

    .option-label {
      font-weight: 500;
      margin-bottom: var(--spacing-xs, 4px);
    }

    .option-items {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs, 4px);
    }

    .item-row {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm, 8px);
      font-size: var(--font-size-sm, 14px);
    }

    .item-name {
      font-weight: 500;
    }

    .item-quantity {
      color: var(--color-text-secondary, #666);
    }

    .item-details {
      color: var(--color-text-secondary, #666);
      font-size: 12px;
    }

    .item-type-badge {
      font-size: 10px;
      padding: 2px 6px;
      background: var(--color-surface, #f5f5f5);
      border-radius: var(--radius-sm, 4px);
      text-transform: capitalize;
    }

    /* Selected equipment summary */
    .selected-summary {
      background: var(--color-surface, #f5f5f5);
      border-radius: var(--radius-md, 8px);
      padding: var(--spacing-lg, 16px);
    }

    .summary-title {
      font-size: var(--font-size-lg, 18px);
      font-weight: 600;
      margin: 0 0 var(--spacing-md, 12px);
    }

    .summary-empty {
      color: var(--color-text-secondary, #666);
      font-style: italic;
    }

    .summary-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs, 4px);
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-sm, 8px) var(--spacing-md, 12px);
      background: var(--color-background, #fff);
      border-radius: var(--radius-sm, 4px);
    }

    .summary-item-name {
      font-weight: 500;
    }

    .summary-item-details {
      font-size: var(--font-size-sm, 14px);
      color: var(--color-text-secondary, #666);
    }

    /* Granted equipment section */
    .granted-section {
      background: rgba(76, 175, 80, 0.05);
      border: 1px solid rgba(76, 175, 80, 0.2);
      border-radius: var(--radius-md, 8px);
      padding: var(--spacing-lg, 16px);
    }

    .granted-title {
      font-size: var(--font-size-md, 16px);
      font-weight: 600;
      color: var(--color-success, #4caf50);
      margin: 0 0 var(--spacing-md, 12px);
    }

    .granted-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs, 4px);
    }

    .granted-item {
      padding: var(--spacing-sm, 8px);
      background: var(--color-background, #fff);
      border-radius: var(--radius-sm, 4px);
    }

    /* Search/filter for available equipment */
    .equipment-browser {
      background: var(--color-surface, #f5f5f5);
      border-radius: var(--radius-md, 8px);
      padding: var(--spacing-lg, 16px);
    }

    .browser-header {
      display: flex;
      gap: var(--spacing-md, 12px);
      margin-bottom: var(--spacing-md, 12px);
    }

    .search-input {
      flex: 1;
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
    }

    .equipment-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: var(--spacing-md, 12px);
      max-height: 400px;
      overflow-y: auto;
    }

    .equipment-card {
      padding: var(--spacing-md, 12px);
      background: var(--color-background, #fff);
      border: 2px solid var(--color-border, #ddd);
      border-radius: var(--radius-md, 8px);
      cursor: pointer;
      transition: all 0.2s;
    }

    .equipment-card:hover {
      border-color: var(--color-primary-light, #7986cb);
      transform: translateY(-1px);
    }

    .equipment-card.in-inventory {
      border-color: var(--color-success, #4caf50);
      background: rgba(76, 175, 80, 0.05);
    }

    .equipment-card h4 {
      margin: 0 0 var(--spacing-xs, 4px);
      font-size: var(--font-size-md, 16px);
    }

    .equipment-card .eq-meta {
      font-size: var(--font-size-sm, 14px);
      color: var(--color-text-secondary, #666);
    }

    .equipment-card .eq-tags {
      display: flex;
      gap: 4px;
      margin-top: var(--spacing-sm, 8px);
    }

    .equipment-card .eq-tag {
      font-size: 11px;
      padding: 2px 6px;
      background: var(--color-surface, #f5f5f5);
      border-radius: var(--radius-sm, 4px);
    }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: var(--spacing-xl, 24px);
      color: var(--color-text-secondary, #666);
    }
  `;

  @property({ type: Array }) choiceGroups: EquipmentChoiceGroup[] = [];
  @property({ type: Array }) grantedEquipment: string[] = [];
  @property({ type: Boolean }) showBrowser = false;
  @property({ type: Array }) additionalItems: EquipmentItem[] = [];

  @state() private searchQuery = '';
  @state() private typeFilter = '';

  private get allEquipment(): ModuleEquipment[] {
    return packLoader.getAllEquipment();
  }

  private get filteredEquipment(): ModuleEquipment[] {
    let items = this.allEquipment;

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      items = items.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    }

    if (this.typeFilter) {
      items = items.filter(item => item.type === this.typeFilter);
    }

    return items;
  }

  private get equipmentTypes(): string[] {
    const types = new Set(this.allEquipment.map(e => e.type));
    return Array.from(types).sort();
  }

  private get selectedEquipment(): EquipmentItem[] {
    const items: EquipmentItem[] = [];

    // Add items from choice groups
    for (const group of this.choiceGroups) {
      if (group.selectedIndex !== null && group.options[group.selectedIndex]) {
        items.push(...group.options[group.selectedIndex].items);
      }
    }

    // Add additional items
    items.push(...this.additionalItems);

    return items;
  }

  private handleChoiceSelect(groupId: string, optionIndex: number) {
    this.dispatchEvent(new CustomEvent('selection-change', {
      detail: {
        type: 'choice',
        groupId,
        selectedIndex: optionIndex,
      },
      bubbles: true,
      composed: true,
    }));
  }

  private handleAddItem(item: ModuleEquipment) {
    this.dispatchEvent(new CustomEvent('selection-change', {
      detail: {
        type: 'add-item',
        item: {
          itemId: item.id,
          name: item.name,
          quantity: 1,
          details: item,
        },
      },
      bubbles: true,
      composed: true,
    }));
  }

  private handleSearchInput(e: Event) {
    this.searchQuery = (e.target as HTMLInputElement).value;
  }

  private handleTypeFilter(e: Event) {
    this.typeFilter = (e.target as HTMLSelectElement).value;
  }

  private renderChoiceGroup(group: EquipmentChoiceGroup) {
    const isSelected = group.selectedIndex !== null;

    return html`
      <div class="choice-group">
        <div class="choice-header">
          <h4 class="choice-title">${group.description ?? 'Choose one:'}</h4>
          <span class="choice-status ${isSelected ? 'selected' : 'pending'}">
            ${isSelected ? 'Selected' : 'Pending'}
          </span>
        </div>

        <div class="option-list">
          ${group.options.map((option, index) => html`
            <div
              class="option-card ${group.selectedIndex === index ? 'selected' : ''}"
              @click=${() => this.handleChoiceSelect(group.id, index)}
            >
              <div class="option-radio">
                <input
                  type="radio"
                  name=${`choice-${group.id}`}
                  .checked=${group.selectedIndex === index}
                  @change=${() => this.handleChoiceSelect(group.id, index)}
                />
              </div>
              <div class="option-content">
                <div class="option-label">${option.label}</div>
                <div class="option-items">
                  ${option.items.map(item => html`
                    <div class="item-row">
                      ${item.quantity > 1 ? html`
                        <span class="item-quantity">${item.quantity}x</span>
                      ` : ''}
                      <span class="item-name">${item.name}</span>
                      ${item.details ? html`
                        <span class="item-type-badge">${item.details.type}</span>
                        ${item.details.weapon ? html`
                          <span class="item-details">
                            ${item.details.weapon.damage} ${item.details.weapon.damageType}
                          </span>
                        ` : ''}
                        ${item.details.armor ? html`
                          <span class="item-details">AC ${item.details.armor.baseAC}</span>
                        ` : ''}
                      ` : ''}
                    </div>
                  `)}
                </div>
              </div>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  private renderGrantedEquipment() {
    if (this.grantedEquipment.length === 0) return null;

    return html`
      <div class="granted-section">
        <h4 class="granted-title">Granted Equipment (from background)</h4>
        <ul class="granted-list">
          ${this.grantedEquipment.map(item => html`
            <li class="granted-item">${item}</li>
          `)}
        </ul>
      </div>
    `;
  }

  private renderSelectedSummary() {
    const items = this.selectedEquipment;

    return html`
      <div class="selected-summary">
        <h3 class="summary-title">Selected Equipment</h3>
        ${items.length === 0 ? html`
          <p class="summary-empty">No equipment selected yet. Make your choices above.</p>
        ` : html`
          <div class="summary-list">
            ${items.map(item => html`
              <div class="summary-item">
                <span class="summary-item-name">
                  ${item.quantity > 1 ? `${item.quantity}x ` : ''}${item.name}
                </span>
                ${item.details ? html`
                  <span class="summary-item-details">
                    ${item.details.type}
                    ${item.details.cost ? ` - ${item.details.cost.amount} ${item.details.cost.unit}` : ''}
                  </span>
                ` : ''}
              </div>
            `)}
          </div>
        `}
      </div>
    `;
  }

  private renderEquipmentBrowser() {
    if (!this.showBrowser) return null;

    const selectedIds = new Set(this.additionalItems.map(i => i.itemId));

    return html`
      <div class="equipment-browser">
        <h4 class="choice-title">Additional Equipment</h4>
        <div class="browser-header">
          <input
            type="text"
            class="search-input"
            placeholder="Search equipment..."
            .value=${this.searchQuery}
            @input=${this.handleSearchInput}
          />
          <select class="filter-select" @change=${this.handleTypeFilter}>
            <option value="">All Types</option>
            ${this.equipmentTypes.map(type => html`
              <option value=${type} ?selected=${this.typeFilter === type}>
                ${type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            `)}
          </select>
        </div>

        <div class="equipment-grid">
          ${this.filteredEquipment.slice(0, 24).map(item => html`
            <div
              class="equipment-card ${selectedIds.has(item.id) ? 'in-inventory' : ''}"
              @click=${() => this.handleAddItem(item)}
            >
              <h4>${item.name}</h4>
              <div class="eq-meta">
                ${item.weapon ? `${item.weapon.damage} ${item.weapon.damageType}` : ''}
                ${item.armor ? `AC ${item.armor.baseAC}` : ''}
                ${!item.weapon && !item.armor ? item.type : ''}
              </div>
              <div class="eq-tags">
                <span class="eq-tag">${item.cost?.amount ?? 0} ${item.cost?.unit ?? 'gp'}</span>
                <span class="eq-tag">${item.weight ?? 0} lb</span>
              </div>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  render() {
    const hasChoices = this.choiceGroups.length > 0;
    const hasGranted = this.grantedEquipment.length > 0;

    if (!hasChoices && !hasGranted && !this.showBrowser) {
      return html`
        <div class="empty-state">
          No equipment choices available. Select a class first.
        </div>
      `;
    }

    return html`
      <div class="equipment-resolver">
        ${this.renderGrantedEquipment()}

        ${this.choiceGroups.map(group => this.renderChoiceGroup(group))}

        ${this.renderSelectedSummary()}

        ${this.renderEquipmentBrowser()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'equipment-choice-resolver': EquipmentChoiceResolver;
  }
}
