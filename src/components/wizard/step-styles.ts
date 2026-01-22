import { css } from 'lit';

/**
 * Shared styles for wizard step components
 */
export const stepStyles = css`
  :host {
    display: block;
  }

  .step-container {
    padding: var(--spacing-md) 0;
  }

  .step-title {
    font-size: var(--font-size-xl);
    font-weight: 600;
    margin: 0 0 var(--spacing-sm);
    color: var(--color-text-primary);
  }

  .step-description {
    font-size: var(--font-size-md);
    color: var(--color-text-secondary);
    margin: 0 0 var(--spacing-lg);
  }

  .form-group {
    margin-bottom: var(--spacing-lg);
  }

  .form-group label {
    display: block;
    margin-bottom: var(--spacing-sm);
    font-weight: 500;
    color: var(--color-text-primary);
  }

  .form-group .hint {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    margin-top: var(--spacing-xs);
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-md);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-md);
    font-family: inherit;
    background: var(--color-background);
    color: var(--color-text-primary);
    box-sizing: border-box;
  }

  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(92, 107, 192, 0.2);
  }

  .form-group input.error,
  .form-group select.error {
    border-color: var(--color-danger);
  }

  .form-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-md);
  }

  .required::after {
    content: ' *';
    color: var(--color-danger);
  }

  .error-message {
    color: var(--color-danger);
    font-size: var(--font-size-sm);
    margin-top: var(--spacing-xs);
  }

  .option-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--spacing-md);
  }

  .option-card {
    padding: var(--spacing-md);
    border: 2px solid var(--color-border);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: border-color 0.2s, background-color 0.2s, transform 0.1s;
    background: var(--color-background);
  }

  .option-card:hover {
    border-color: var(--color-primary-light);
    transform: translateY(-1px);
  }

  .option-card.selected {
    border-color: var(--color-primary);
    background-color: rgba(92, 107, 192, 0.1);
  }

  .option-card.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .option-card h4 {
    margin: 0 0 var(--spacing-xs);
    font-size: var(--font-size-md);
    color: var(--color-text-primary);
  }

  .option-card p {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    line-height: 1.4;
  }

  .option-card .details {
    margin-top: var(--spacing-sm);
    padding-top: var(--spacing-sm);
    border-top: 1px solid var(--color-border);
    font-size: var(--font-size-sm);
  }

  .option-card .tag {
    display: inline-block;
    padding: 2px 8px;
    background: var(--color-surface);
    border-radius: var(--radius-sm);
    font-size: 11px;
    margin-right: var(--spacing-xs);
    margin-top: var(--spacing-xs);
  }

  .empty-state {
    text-align: center;
    padding: var(--spacing-xl);
    color: var(--color-text-secondary);
  }

  .empty-state p {
    margin: var(--spacing-sm) 0;
  }

  .checkbox-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .checkbox-item {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-sm);
    cursor: pointer;
    padding: var(--spacing-sm);
    border-radius: var(--radius-sm);
    transition: background-color 0.2s;
  }

  .checkbox-item:hover {
    background: var(--color-surface);
  }

  .checkbox-item input[type="checkbox"] {
    width: auto;
    margin-top: 3px;
  }

  .checkbox-item .checkbox-label {
    flex: 1;
  }

  .checkbox-item .checkbox-label strong {
    display: block;
    color: var(--color-text-primary);
  }

  .checkbox-item .checkbox-label small {
    color: var(--color-text-secondary);
  }

  .section-title {
    font-size: var(--font-size-lg);
    font-weight: 600;
    margin: var(--spacing-lg) 0 var(--spacing-md);
    padding-bottom: var(--spacing-sm);
    border-bottom: 1px solid var(--color-border);
  }

  .info-box {
    background: var(--color-surface);
    border-radius: var(--radius-md);
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
  }

  .info-box.warning {
    background: rgba(255, 167, 38, 0.1);
    border-left: 3px solid var(--color-warning);
  }

  .info-box.info {
    background: rgba(92, 107, 192, 0.1);
    border-left: 3px solid var(--color-primary);
  }
`;
