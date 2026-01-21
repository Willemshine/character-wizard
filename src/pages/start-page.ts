import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { store } from '../store/store.ts';
import { router } from '../router/router.ts';
import { persistence } from '../services/persistence.ts';
import { characterValidator } from '../services/character-validator.ts';
import type { CharacterSummary, Character, Unsubscribe } from '../types/index.ts';
import '../components/ui/cw-button.ts';
import '../components/ui/cw-card.ts';

@customElement('start-page')
export class StartPage extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: var(--spacing-xl);
      max-width: 800px;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      margin-bottom: var(--spacing-2xl);
    }

    .header h1 {
      font-size: 2.5rem;
      color: var(--color-primary);
      margin-bottom: var(--spacing-sm);
    }

    .header p {
      color: var(--color-text-secondary);
      font-size: var(--font-size-lg);
    }

    .main-actions {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-2xl);
    }

    @media (max-width: 600px) {
      .main-actions {
        grid-template-columns: 1fr;
      }
    }

    .action-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--spacing-xl);
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      text-align: center;
      border: 2px solid transparent;
    }

    .action-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .action-card:focus-visible {
      outline: none;
      border-color: var(--color-primary);
    }

    .action-card.primary {
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark, #4338ca));
      color: white;
    }

    .action-card.primary:hover {
      background: linear-gradient(135deg, var(--color-primary-dark, #4338ca), var(--color-primary));
    }

    .action-icon {
      font-size: 2.5rem;
      margin-bottom: var(--spacing-md);
    }

    .action-title {
      font-size: var(--font-size-lg);
      font-weight: 600;
      margin-bottom: var(--spacing-xs);
    }

    .action-description {
      font-size: var(--font-size-sm);
      opacity: 0.8;
    }

    .action-card.primary .action-description {
      opacity: 0.9;
    }

    .upload-input {
      display: none;
    }

    .error-message {
      background: var(--color-error-bg, #fef2f2);
      color: var(--color-error, #dc2626);
      padding: var(--spacing-md);
      border-radius: var(--radius-md);
      margin-bottom: var(--spacing-lg);
      text-align: center;
    }

    .success-message {
      background: var(--color-success-bg, #f0fdf4);
      color: var(--color-success, #16a34a);
      padding: var(--spacing-md);
      border-radius: var(--radius-md);
      margin-bottom: var(--spacing-lg);
      text-align: center;
    }

    .characters-section {
      margin-top: var(--spacing-xl);
    }

    .characters-section h2 {
      margin-bottom: var(--spacing-md);
      color: var(--color-text-secondary);
      font-size: var(--font-size-lg);
    }

    .character-list {
      display: grid;
      gap: var(--spacing-md);
    }

    .character-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md);
      background: var(--color-surface);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      cursor: pointer;
      transition: box-shadow 0.2s;
    }

    .character-item:hover {
      box-shadow: var(--shadow-md);
    }

    .character-info h3 {
      margin: 0 0 var(--spacing-xs);
    }

    .character-meta {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
    }

    .character-actions {
      display: flex;
      gap: var(--spacing-sm);
    }

    .empty-state {
      text-align: center;
      padding: var(--spacing-xl);
      color: var(--color-text-secondary);
      background: var(--color-surface);
      border-radius: var(--radius-md);
      border: 2px dashed var(--color-border, #e5e7eb);
    }
  `;

  @state() private characters: CharacterSummary[] = [];
  @state() private errorMessage: string | null = null;
  @state() private successMessage: string | null = null;

  private unsubscribe: Unsubscribe | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribe = store.subscribe('characters', (characters) => {
      this.characters = characters;
    });
    this.loadCharacters();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe?.();
  }

  private async loadCharacters() {
    const characters = await persistence.getAllCharacters();
    store.setCharacters(characters);
  }

  private handleStartWizard() {
    router.navigate('wizard');
  }

  private handleUploadClick() {
    const input = this.shadowRoot?.querySelector('.upload-input') as HTMLInputElement;
    input?.click();
  }

  private async handleFileUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Clear previous messages
    this.errorMessage = null;
    this.successMessage = null;

    try {
      const text = await file.text();
      const result = characterValidator.parseAndValidate(text);

      if (!result.valid) {
        this.errorMessage = `Invalid character file: ${result.errors.join(', ')}`;
        input.value = '';
        return;
      }

      // Import and save the character
      const character = await persistence.importCharacter(text);

      // Update store
      const summary: CharacterSummary = {
        id: character.id,
        name: character.name || 'Unnamed Character',
        race: character.race || '',
        class: character.class || '',
        level: character.level || 1,
        updatedAt: character.updatedAt,
      };
      store.addCharacter(summary);
      store.setCurrentCharacter(character as Character);

      // Show success and navigate
      this.successMessage = `Character "${character.name || 'Unnamed'}" imported successfully!`;

      // Navigate to character page after brief delay
      setTimeout(() => {
        router.navigate('character', { id: character.id });
      }, 500);
    } catch (err) {
      this.errorMessage = `Error importing character: ${err instanceof Error ? err.message : 'Unknown error'}`;
    }

    input.value = '';
  }

  private handleOptions() {
    router.navigate('options');
  }

  private handleOpenCharacter(id: string) {
    persistence.setLastOpenedCharacter(id);
    router.navigate('character', { id });
  }

  private async handleDeleteCharacter(e: Event, id: string) {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this character?')) {
      await persistence.deleteCharacter(id);
      store.removeCharacter(id);
    }
  }

  render() {
    return html`
      <div class="header">
        <h1>Character Wizard</h1>
        <p>Create and manage your tabletop RPG characters</p>
      </div>

      ${this.errorMessage
        ? html`<div class="error-message">${this.errorMessage}</div>`
        : null}
      ${this.successMessage
        ? html`<div class="success-message">${this.successMessage}</div>`
        : null}

      <div class="main-actions">
        <div
          class="action-card primary"
          tabindex="0"
          role="button"
          @click=${this.handleStartWizard}
          @keydown=${(e: KeyboardEvent) => e.key === 'Enter' && this.handleStartWizard()}
        >
          <div class="action-icon">+</div>
          <div class="action-title">Start Wizard</div>
          <div class="action-description">Create a new character step by step</div>
        </div>

        <div
          class="action-card"
          tabindex="0"
          role="button"
          @click=${this.handleUploadClick}
          @keydown=${(e: KeyboardEvent) => e.key === 'Enter' && this.handleUploadClick()}
        >
          <div class="action-icon">^</div>
          <div class="action-title">Upload Character</div>
          <div class="action-description">Import a character from JSON file</div>
        </div>
        <input
          type="file"
          class="upload-input"
          accept=".json,application/json"
          @change=${this.handleFileUpload}
        />

        <div
          class="action-card"
          tabindex="0"
          role="button"
          @click=${this.handleOptions}
          @keydown=${(e: KeyboardEvent) => e.key === 'Enter' && this.handleOptions()}
        >
          <div class="action-icon">*</div>
          <div class="action-title">Options</div>
          <div class="action-description">Manage modules and settings</div>
        </div>
      </div>

      ${this.characters.length > 0
        ? html`
            <div class="characters-section">
              <h2>Your Characters</h2>
              <div class="character-list">
                ${this.characters.map(
                  (char) => html`
                    <div
                      class="character-item"
                      @click=${() => this.handleOpenCharacter(char.id)}
                    >
                      <div class="character-info">
                        <h3>${char.name || 'Unnamed Character'}</h3>
                        <div class="character-meta">
                          Level ${char.level} ${char.race} ${char.class}
                        </div>
                      </div>
                      <div class="character-actions">
                        <cw-button
                          variant="danger"
                          size="small"
                          @click=${(e: Event) => this.handleDeleteCharacter(e, char.id)}
                        >
                          Delete
                        </cw-button>
                      </div>
                    </div>
                  `
                )}
              </div>
            </div>
          `
        : html`
            <div class="characters-section">
              <h2>Your Characters</h2>
              <div class="empty-state">
                <p>No characters yet. Start the wizard or upload a character to get started!</p>
              </div>
            </div>
          `}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'start-page': StartPage;
  }
}
