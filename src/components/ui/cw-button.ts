import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('cw-button')
export class CwButton extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
    }

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      font-size: 1rem;
      font-weight: 500;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.2s, transform 0.1s;
      min-width: 100px;
    }

    button:active {
      transform: scale(0.98);
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .primary {
      background-color: var(--color-primary);
      color: white;
    }

    .primary:hover:not(:disabled) {
      background-color: var(--color-primary-dark);
    }

    .secondary {
      background-color: transparent;
      color: var(--color-primary);
      border: 2px solid var(--color-primary);
    }

    .secondary:hover:not(:disabled) {
      background-color: var(--color-primary);
      color: white;
    }

    .danger {
      background-color: var(--color-error);
      color: white;
    }

    .danger:hover:not(:disabled) {
      background-color: #d32f2f;
    }

    .small {
      padding: 0.375rem 0.75rem;
      font-size: 0.875rem;
      min-width: 80px;
    }

    .large {
      padding: 0.875rem 1.75rem;
      font-size: 1.125rem;
      min-width: 120px;
    }
  `;

  @property({ type: String }) variant: 'primary' | 'secondary' | 'danger' = 'primary';
  @property({ type: String }) size: 'small' | 'medium' | 'large' = 'medium';
  @property({ type: Boolean }) disabled = false;

  render() {
    return html`
      <button
        class="${this.variant} ${this.size}"
        ?disabled=${this.disabled}
        @click=${this._handleClick}
      >
        <slot></slot>
      </button>
    `;
  }

  private _handleClick(e: MouseEvent) {
    if (this.disabled) {
      e.preventDefault();
      e.stopPropagation();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cw-button': CwButton;
  }
}
