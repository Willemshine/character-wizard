import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { router } from '../router/router.ts';
import { persistence } from '../services/persistence.ts';
import { packLoader } from '../services/pack-loader.ts';
import { calculateModifier, type Character } from '../types/index.ts';
import '../components/ui/cw-button.ts';
import '../components/ui/cw-card.ts';

@customElement('character-page')
export class CharacterPage extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: var(--spacing-xl);
      max-width: 1000px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--spacing-xl);
    }

    .header-info h1 {
      margin: 0 0 var(--spacing-xs);
    }

    .header-info p {
      margin: 0;
      color: var(--color-text-secondary);
      font-size: var(--font-size-lg);
    }

    .header-actions {
      display: flex;
      gap: var(--spacing-sm);
    }

    .character-sheet {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-lg);
    }

    @media (max-width: 768px) {
      .character-sheet {
        grid-template-columns: 1fr;
      }
    }

    .section {
      background: var(--color-surface);
      border-radius: var(--radius-md);
      padding: var(--spacing-lg);
      box-shadow: var(--shadow-sm);
    }

    .section h2 {
      margin: 0 0 var(--spacing-md);
      font-size: var(--font-size-lg);
      color: var(--color-primary);
      border-bottom: 2px solid var(--color-primary);
      padding-bottom: var(--spacing-sm);
    }

    .ability-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-sm);
    }

    .ability-box {
      text-align: center;
      padding: var(--spacing-sm);
      background: var(--color-background);
      border-radius: var(--radius-sm);
    }

    .ability-box .name {
      font-size: 0.75rem;
      text-transform: uppercase;
      color: var(--color-text-secondary);
      margin-bottom: var(--spacing-xs);
    }

    .ability-box .score {
      font-size: 1.5rem;
      font-weight: 600;
    }

    .ability-box .modifier {
      font-size: 0.875rem;
      color: var(--color-primary);
    }

    .stats-row {
      display: flex;
      justify-content: space-around;
      margin-bottom: var(--spacing-md);
    }

    .stat-box {
      text-align: center;
      padding: var(--spacing-md);
      background: var(--color-background);
      border-radius: var(--radius-sm);
      min-width: 80px;
    }

    .stat-box .label {
      font-size: 0.75rem;
      text-transform: uppercase;
      color: var(--color-text-secondary);
    }

    .stat-box .value {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--color-primary);
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      padding: var(--spacing-sm) 0;
      border-bottom: 1px solid var(--color-border);
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .info-label {
      color: var(--color-text-secondary);
    }

    .list-section ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .list-section li {
      padding: var(--spacing-sm) 0;
      border-bottom: 1px solid var(--color-border);
    }

    .list-section li:last-child {
      border-bottom: none;
    }

    .notes-area {
      width: 100%;
      min-height: 120px;
      padding: var(--spacing-md);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      font-family: inherit;
      font-size: var(--font-size-md);
      resize: vertical;
    }

    .notes-area:focus {
      outline: none;
      border-color: var(--color-primary);
    }

    .empty-state {
      text-align: center;
      padding: var(--spacing-xl);
      color: var(--color-text-secondary);
    }

    .loading {
      text-align: center;
      padding: var(--spacing-xl);
    }
  `;

  @state() private character: Character | null = null;
  @state() private isLoading = true;

  private unsubscribeRouter: (() => void) | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribeRouter = router.subscribe((_, params) => {
      if (params.id) {
        this.loadCharacter(params.id);
      }
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribeRouter?.();
  }

  private async loadCharacter(id: string) {
    this.isLoading = true;
    const character = await persistence.getCharacter(id);
    this.character = character ?? null;
    this.isLoading = false;
  }

  private handleBack() {
    router.navigate('start');
  }

  private async handleExport() {
    if (!this.character) return;

    const json = await persistence.exportCharacter(this.character.id);
    if (!json) return;

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.character.name || 'character'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private async handleNotesChange(e: Event) {
    if (!this.character) return;

    const notes = (e.target as HTMLTextAreaElement).value;
    this.character = { ...this.character, notes };
    await persistence.saveCharacter(this.character);
  }

  private formatModifier(score: number): string {
    const mod = calculateModifier(score);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  }

  private getRaceName(): string {
    const race = packLoader.getAllRaces().find((r) => r.id === this.character?.race);
    return race?.name || this.character?.race || 'Unknown';
  }

  private getClassName(): string {
    const cls = packLoader.getAllClasses().find((c) => c.id === this.character?.class);
    return cls?.name || this.character?.class || 'Unknown';
  }

  private getBackgroundName(): string {
    const bg = packLoader.getAllBackgrounds().find((b) => b.id === this.character?.background);
    return bg?.name || this.character?.background || 'Unknown';
  }

  render() {
    if (this.isLoading) {
      return html`<div class="loading">Loading character...</div>`;
    }

    if (!this.character) {
      return html`
        <div class="empty-state">
          <p>Character not found.</p>
          <cw-button @click=${this.handleBack}>Back to Home</cw-button>
        </div>
      `;
    }

    const abilities = [
      { key: 'strength', name: 'STR' },
      { key: 'dexterity', name: 'DEX' },
      { key: 'constitution', name: 'CON' },
      { key: 'intelligence', name: 'INT' },
      { key: 'wisdom', name: 'WIS' },
      { key: 'charisma', name: 'CHA' },
    ] as const;

    return html`
      <div class="header">
        <div class="header-info">
          <h1>${this.character.name || 'Unnamed Character'}</h1>
          <p>Level ${this.character.level} ${this.getRaceName()} ${this.getClassName()}</p>
        </div>
        <div class="header-actions">
          <cw-button variant="secondary" @click=${this.handleExport}>Export</cw-button>
          <cw-button variant="secondary" @click=${this.handleBack}>Back</cw-button>
        </div>
      </div>

      <div class="character-sheet">
        <div class="section">
          <h2>Combat Stats</h2>
          <div class="stats-row">
            <div class="stat-box">
              <div class="label">HP</div>
              <div class="value">${this.character.hitPoints}/${this.character.maxHitPoints}</div>
            </div>
            <div class="stat-box">
              <div class="label">AC</div>
              <div class="value">${this.character.armorClass}</div>
            </div>
            <div class="stat-box">
              <div class="label">Prof</div>
              <div class="value">+${this.character.proficiencyBonus}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Ability Scores</h2>
          <div class="ability-grid">
            ${abilities.map(
              ({ key, name }) => html`
                <div class="ability-box">
                  <div class="name">${name}</div>
                  <div class="score">${this.character!.abilityScores[key]}</div>
                  <div class="modifier">
                    ${this.formatModifier(this.character!.abilityScores[key])}
                  </div>
                </div>
              `
            )}
          </div>
        </div>

        <div class="section">
          <h2>Character Info</h2>
          <div class="info-row">
            <span class="info-label">Race</span>
            <span>${this.getRaceName()}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Class</span>
            <span>${this.getClassName()}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Background</span>
            <span>${this.getBackgroundName()}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Level</span>
            <span>${this.character.level}</span>
          </div>
        </div>

        <div class="section list-section">
          <h2>Skills</h2>
          ${this.character.skills.length > 0
            ? html`
                <ul>
                  ${this.character.skills.map((skill) => html`<li>${skill}</li>`)}
                </ul>
              `
            : html`<p>No skills selected.</p>`}
        </div>

        <div class="section list-section">
          <h2>Equipment</h2>
          ${this.character.equipment.length > 0
            ? html`
                <ul>
                  ${this.character.equipment.map((item) => html`<li>${item}</li>`)}
                </ul>
              `
            : html`<p>No equipment.</p>`}
        </div>

        <div class="section list-section">
          <h2>Features</h2>
          ${this.character.features.length > 0
            ? html`
                <ul>
                  ${this.character.features.map((feature) => html`<li>${feature}</li>`)}
                </ul>
              `
            : html`<p>No features.</p>`}
        </div>

        <div class="section" style="grid-column: 1 / -1;">
          <h2>Notes</h2>
          <textarea
            class="notes-area"
            .value=${this.character.notes}
            @change=${this.handleNotesChange}
            placeholder="Add notes about your character..."
          ></textarea>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'character-page': CharacterPage;
  }
}
