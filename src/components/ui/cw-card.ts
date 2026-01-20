import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('cw-card')
export class CwCard extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .card {
      background: var(--color-surface);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }

    .card.clickable {
      cursor: pointer;
      transition: box-shadow 0.2s, transform 0.1s;
    }

    .card.clickable:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }

    .card-header {
      padding: var(--spacing-md) var(--spacing-lg);
      border-bottom: 1px solid var(--color-border);
    }

    .card-header h3 {
      margin: 0;
      font-size: var(--font-size-lg);
    }

    .card-content {
      padding: var(--spacing-lg);
    }

    .card-footer {
      padding: var(--spacing-md) var(--spacing-lg);
      border-top: 1px solid var(--color-border);
      background: var(--color-background);
    }
  `;

  @property({ type: String }) header = '';
  @property({ type: Boolean }) clickable = false;

  render() {
    return html`
      <div class="card ${this.clickable ? 'clickable' : ''}">
        ${this.header
          ? html`
              <div class="card-header">
                <h3>${this.header}</h3>
              </div>
            `
          : ''}
        <div class="card-content">
          <slot></slot>
        </div>
        <slot name="footer">
          <div class="card-footer" style="display: none;"></div>
        </slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cw-card': CwCard;
  }
}
