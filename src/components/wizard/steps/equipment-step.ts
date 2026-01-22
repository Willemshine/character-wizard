import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { stepStyles } from '../step-styles.ts';
import type { WizardFormState, StepValidationResult } from '../wizard-types.ts';
import type { EquipmentSelection, EquipmentItem } from '../../../types/character.ts';
import type { ModuleBackground, ModuleEquipment } from '../../../types/module.ts';
import { packLoader } from '../../../services/pack-loader.ts';

@customElement('equipment-step')
export class EquipmentStep extends LitElement {
  static styles = [stepStyles, css`
    .equipment-section {
      margin-bottom: var(--spacing-xl);
    }

    .equipment-section h3 {
      margin-bottom: var(--spacing-md);
    }

    .equipment-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .equipment-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      background: var(--color-surface);
      border-radius: var(--radius-md);
    }

    .equipment-item .item-info {
      flex: 1;
    }

    .equipment-item .item-name {
      font-weight: 500;
    }

    .equipment-item .item-details {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    .equipment-item .quantity-input {
      width: 60px;
      text-align: center;
      padding: var(--spacing-xs) var(--spacing-sm);
    }

    .equipment-choice {
      margin-bottom: var(--spacing-lg);
      padding: var(--spacing-md);
      background: var(--color-background);
      border-radius: var(--radius-md);
    }

    .equipment-choice h4 {
      margin: 0 0 var(--spacing-sm);
      font-size: var(--font-size-md);
    }

    .choice-options {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .choice-option {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .choice-option:hover {
      background: var(--color-surface);
    }

    .choice-option input[type="radio"] {
      width: 18px;
      height: 18px;
    }

    .granted-equipment {
      background: var(--color-surface);
      padding: var(--spacing-md);
      border-radius: var(--radius-md);
      margin-top: var(--spacing-lg);
    }

    .granted-equipment h4 {
      margin: 0 0 var(--spacing-md);
    }

    .granted-equipment ul {
      margin: 0;
      padding-left: var(--spacing-lg);
    }

    .granted-equipment li {
      margin-bottom: var(--spacing-xs);
    }

    .currency-section {
      display: flex;
      gap: var(--spacing-md);
      margin-top: var(--spacing-lg);
      padding: var(--spacing-md);
      background: var(--color-surface);
      border-radius: var(--radius-md);
    }

    .currency-input {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .currency-input label {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin-bottom: var(--spacing-xs);
    }

    .currency-input input {
      width: 60px;
      text-align: center;
      padding: var(--spacing-sm);
    }
  `];

  @property({ type: Object }) formState!: WizardFormState;
  @state() private selectedBackground: ModuleBackground | null = null;
  @state() private allEquipment: ModuleEquipment[] = [];

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
    const backgroundId = this.formState.character.selections.background?.backgroundId;

    if (backgroundId) {
      const backgrounds = packLoader.getAllBackgrounds();
      this.selectedBackground = backgrounds.find(b => b.id === backgroundId) ?? null;
    }

    this.allEquipment = packLoader.getAllEquipment();
  }

  private dispatchUpdate(equipment: Partial<EquipmentSelection>) {
    const current = this.formState.character.selections.equipment;
    this.dispatchEvent(new CustomEvent('selection-update', {
      detail: {
        equipment: { ...current, ...equipment },
      },
      bubbles: true,
      composed: true,
    }));
  }

  static validate(_formState: WizardFormState): StepValidationResult {
    const errors: string[] = [];

    // Equipment step is generally optional - you can proceed with defaults
    // But you could add validation for required choices here

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private handleAddEquipment(itemId: string) {
    const current = this.formState.character.selections.equipment;
    const existing = current.startingEquipment.find(e => e.itemId === itemId);

    if (existing) {
      this.dispatchUpdate({
        startingEquipment: current.startingEquipment.map(e =>
          e.itemId === itemId ? { ...e, quantity: e.quantity + 1 } : e
        ),
      });
    } else {
      const newItem: EquipmentItem = {
        itemId,
        quantity: 1,
        equipped: false,
      };
      this.dispatchUpdate({
        startingEquipment: [...current.startingEquipment, newItem],
      });
    }
  }

  private handleQuantityChange(itemId: string, quantity: number) {
    const current = this.formState.character.selections.equipment;

    if (quantity <= 0) {
      this.dispatchUpdate({
        startingEquipment: current.startingEquipment.filter(e => e.itemId !== itemId),
      });
    } else {
      this.dispatchUpdate({
        startingEquipment: current.startingEquipment.map(e =>
          e.itemId === itemId ? { ...e, quantity } : e
        ),
      });
    }
  }

  private handleCurrencyChange(unit: 'cp' | 'sp' | 'ep' | 'gp' | 'pp', value: number) {
    const current = this.formState.character.selections.equipment;
    this.dispatchUpdate({
      currency: {
        ...current.currency,
        [unit]: Math.max(0, value),
      },
    });
  }

  private getEquipmentDetails(itemId: string): ModuleEquipment | undefined {
    return this.allEquipment.find(e => e.id === itemId);
  }

  private renderBackgroundEquipment() {
    if (!this.selectedBackground?.equipment.length) return null;

    return html`
      <div class="granted-equipment">
        <h4>Background Equipment (${this.selectedBackground.name})</h4>
        <ul>
          ${this.selectedBackground.equipment.map(item => html`
            <li>${item}</li>
          `)}
        </ul>
      </div>
    `;
  }

  private renderSelectedEquipment() {
    const items = this.formState.character.selections.equipment.startingEquipment;

    if (items.length === 0) {
      return html`
        <div class="info-box">
          <p>No equipment selected yet. Add items from the list below.</p>
        </div>
      `;
    }

    return html`
      <div class="equipment-section">
        <h3>Selected Equipment</h3>
        <div class="equipment-list">
          ${items.map(item => {
            const details = this.getEquipmentDetails(item.itemId);
            return html`
              <div class="equipment-item">
                <span class="item-info">
                  <span class="item-name">${details?.name ?? item.itemId}</span>
                  ${details ? html`
                    <span class="item-details">
                      ${details.type}
                      ${details.weapon ? ` - ${details.weapon.damage} ${details.weapon.damageType}` : ''}
                      ${details.armor ? ` - AC ${details.armor.baseAC}` : ''}
                    </span>
                  ` : ''}
                </span>
                <input
                  type="number"
                  class="quantity-input"
                  min="0"
                  .value=${String(item.quantity)}
                  @input=${(e: Event) => this.handleQuantityChange(
                    item.itemId,
                    parseInt((e.target as HTMLInputElement).value) || 0
                  )}
                />
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }

  private renderAvailableEquipment() {
    const weapons = this.allEquipment.filter(e => e.type === 'weapon');
    const armor = this.allEquipment.filter(e => e.type === 'armor' || e.type === 'shield');
    const gear = this.allEquipment.filter(e => e.type === 'gear');

    const renderCategory = (title: string, items: ModuleEquipment[]) => {
      if (items.length === 0) return null;

      return html`
        <div class="equipment-section">
          <h3>${title}</h3>
          <div class="option-grid">
            ${items.slice(0, 12).map(item => html`
              <div
                class="option-card"
                @click=${() => this.handleAddEquipment(item.id)}
              >
                <h4>${item.name}</h4>
                <p>
                  ${item.weapon ? `${item.weapon.damage} ${item.weapon.damageType}` : ''}
                  ${item.armor ? `AC ${item.armor.baseAC}` : ''}
                  ${!item.weapon && !item.armor ? item.description?.slice(0, 50) || item.type : ''}
                </p>
                <div class="details">
                  <span class="tag">${item.cost.amount} ${item.cost.unit}</span>
                  <span class="tag">${item.weight} lb</span>
                </div>
              </div>
            `)}
          </div>
        </div>
      `;
    };

    return html`
      ${renderCategory('Weapons', weapons)}
      ${renderCategory('Armor & Shields', armor)}
      ${renderCategory('Adventuring Gear', gear)}
    `;
  }

  private renderCurrency() {
    const { currency } = this.formState.character.selections.equipment;

    return html`
      <div class="currency-section">
        <div class="currency-input">
          <label>GP</label>
          <input
            type="number"
            min="0"
            .value=${String(currency.gp)}
            @input=${(e: Event) => this.handleCurrencyChange('gp', parseInt((e.target as HTMLInputElement).value) || 0)}
          />
        </div>
        <div class="currency-input">
          <label>SP</label>
          <input
            type="number"
            min="0"
            .value=${String(currency.sp)}
            @input=${(e: Event) => this.handleCurrencyChange('sp', parseInt((e.target as HTMLInputElement).value) || 0)}
          />
        </div>
        <div class="currency-input">
          <label>CP</label>
          <input
            type="number"
            min="0"
            .value=${String(currency.cp)}
            @input=${(e: Event) => this.handleCurrencyChange('cp', parseInt((e.target as HTMLInputElement).value) || 0)}
          />
        </div>
      </div>
    `;
  }

  render() {
    return html`
      <div class="step-container">
        <h2 class="step-title">Equipment</h2>
        <p class="step-description">
          Select your starting equipment and currency.
        </p>

        ${this.renderBackgroundEquipment()}
        ${this.renderSelectedEquipment()}
        ${this.renderCurrency()}

        <h3 class="section-title">Available Equipment</h3>
        ${this.allEquipment.length > 0 ? html`
          ${this.renderAvailableEquipment()}
        ` : html`
          <div class="info-box">
            <p>No equipment data available. Equipment will be added manually.</p>
          </div>
        `}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'equipment-step': EquipmentStep;
  }
}
