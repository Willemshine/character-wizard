import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { router } from '../router/router.ts';
import { persistence } from '../services/persistence.ts';
import { packLoader } from '../services/pack-loader.ts';
import type { Route } from '../types/index.ts';

import '../pages/start-page.ts';
import '../pages/wizard-page.ts';
import '../pages/options-page.ts';
import '../pages/character-page.ts';

@customElement('app-root')
export class AppRoot extends LitElement {
  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      font-size: var(--font-size-lg);
      color: var(--color-text-secondary);
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--color-border);
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: var(--spacing-md);
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `;

  @state() private currentRoute: Route = 'start';
  @state() private isInitializing = true;

  private unsubscribeRouter: (() => void) | null = null;

  async connectedCallback() {
    super.connectedCallback();
    await this.initialize();

    this.unsubscribeRouter = router.subscribe((route) => {
      this.currentRoute = route;
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribeRouter?.();
  }

  private async initialize() {
    try {
      await persistence.init();
      await packLoader.init();
    } catch (error) {
      console.error('Failed to initialize app:', error);
    } finally {
      this.isInitializing = false;
    }
  }

  private renderPage() {
    switch (this.currentRoute) {
      case 'start':
        return html`<start-page></start-page>`;
      case 'wizard':
        return html`<wizard-page></wizard-page>`;
      case 'options':
        return html`<options-page></options-page>`;
      case 'character':
        return html`<character-page></character-page>`;
      default:
        return html`<start-page></start-page>`;
    }
  }

  render() {
    if (this.isInitializing) {
      return html`
        <div class="loading">
          <div class="loading-spinner"></div>
          Loading...
        </div>
      `;
    }

    return this.renderPage();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-root': AppRoot;
  }
}
