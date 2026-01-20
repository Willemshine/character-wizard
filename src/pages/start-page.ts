import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { store } from '../store/store.ts';
import { router } from '../router/router.ts';
import { persistence } from '../services/persistence.ts';
import type { CharacterSummary, Unsubscribe } from '../types/index.ts';
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
      margin-bottom: var(--spacing-xl);
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

    .actions {
      display: flex;
      gap: var(--spacing-md);
      justify-content: center;
      margin-bottom: var(--spacing-xl);
    }

    .characters-section h2 {
      margin-bottom: var(--spacing-md);
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
    }

    .empty-state p {
      margin-bottom: var(--spacing-md);
    }
  `;

  @state() private characters: CharacterSummary[] = [];
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

  private handleNewCharacter() {
    router.navigate('wizard');
  }

  private handleOpenCharacter(id: string) {
    persistence.setLastOpenedCharacter(id);
    router.navigate('character', { id });
  }

  private handleOptions() {
    router.navigate('options');
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

      <div class="actions">
        <cw-button size="large" @click=${this.handleNewCharacter}>
          New Character
        </cw-button>
        <cw-button variant="secondary" size="large" @click=${this.handleOptions}>
          Options
        </cw-button>
      </div>

      <div class="characters-section">
        <h2>Your Characters</h2>
        ${this.characters.length > 0
          ? html`
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
            `
          : html`
              <div class="empty-state">
                <p>No characters yet. Create your first character to get started!</p>
              </div>
            `}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'start-page': StartPage;
  }
}
