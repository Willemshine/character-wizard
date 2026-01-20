import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { store } from '../store/store.ts';
import { router } from '../router/router.ts';
import { packLoader } from '../services/pack-loader.ts';
import type { ModuleMetadata, Unsubscribe } from '../types/index.ts';
import '../components/ui/cw-button.ts';
import '../components/ui/cw-card.ts';

@customElement('options-page')
export class OptionsPage extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: var(--spacing-xl);
      max-width: 800px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-xl);
    }

    .header h1 {
      margin: 0;
    }

    section {
      margin-bottom: var(--spacing-xl);
    }

    section h2 {
      margin-bottom: var(--spacing-md);
      padding-bottom: var(--spacing-sm);
      border-bottom: 1px solid var(--color-border);
    }

    .module-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .module-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md);
      background: var(--color-surface);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
    }

    .module-info {
      flex: 1;
    }

    .module-info h3 {
      margin: 0 0 var(--spacing-xs);
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .module-info p {
      margin: 0;
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
    }

    .badge {
      font-size: 0.75rem;
      padding: 0.125rem 0.5rem;
      border-radius: 4px;
      font-weight: 500;
    }

    .badge.built-in {
      background: var(--color-primary-light);
      color: white;
    }

    .badge.uploaded {
      background: var(--color-secondary);
      color: white;
    }

    .module-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .toggle {
      position: relative;
      width: 48px;
      height: 24px;
    }

    .toggle input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: var(--color-border);
      transition: 0.3s;
      border-radius: 24px;
    }

    .toggle-slider:before {
      position: absolute;
      content: '';
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
    }

    .toggle input:checked + .toggle-slider {
      background-color: var(--color-primary);
    }

    .toggle input:checked + .toggle-slider:before {
      transform: translateX(24px);
    }

    .upload-section {
      padding: var(--spacing-lg);
      background: var(--color-surface);
      border: 2px dashed var(--color-border);
      border-radius: var(--radius-md);
      text-align: center;
    }

    .upload-section p {
      margin-bottom: var(--spacing-md);
      color: var(--color-text-secondary);
    }

    .file-input {
      display: none;
    }

    .empty-state {
      text-align: center;
      padding: var(--spacing-lg);
      color: var(--color-text-secondary);
    }

    .error-message {
      padding: var(--spacing-md);
      background: #ffebee;
      color: var(--color-error);
      border-radius: var(--radius-sm);
      margin-bottom: var(--spacing-md);
    }

    .success-message {
      padding: var(--spacing-md);
      background: #e8f5e9;
      color: var(--color-success);
      border-radius: var(--radius-sm);
      margin-bottom: var(--spacing-md);
    }
  `;

  @state() private modules: ModuleMetadata[] = [];
  @state() private error: string | null = null;
  @state() private success: string | null = null;
  private unsubscribe: Unsubscribe | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribe = store.subscribe('modules', (modules) => {
      this.modules = modules;
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe?.();
  }

  private handleBack() {
    router.navigate('start');
  }

  private async handleToggleModule(moduleId: string, enabled: boolean) {
    await packLoader.togglePack(moduleId, enabled);
  }

  private async handleUploadClick() {
    const input = this.shadowRoot?.querySelector('.file-input') as HTMLInputElement;
    input?.click();
  }

  private async handleFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.error = null;
    this.success = null;

    try {
      const pack = await packLoader.uploadPack(file);
      this.success = `Successfully loaded module: ${pack.name}`;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to load module';
    }

    input.value = '';
  }

  private async handleRemoveModule(moduleId: string) {
    if (confirm('Are you sure you want to remove this module?')) {
      try {
        await packLoader.removePack(moduleId);
        this.success = 'Module removed successfully';
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to remove module';
      }
    }
  }

  private renderModuleItem(module: ModuleMetadata) {
    return html`
      <div class="module-item">
        <div class="module-info">
          <h3>
            ${module.name}
            ${module.isBuiltIn
              ? html`<span class="badge built-in">Built-in</span>`
              : html`<span class="badge uploaded">Uploaded</span>`}
          </h3>
          <p>${module.description} (v${module.version})</p>
        </div>
        <div class="module-actions">
          <label class="toggle">
            <input
              type="checkbox"
              ?checked=${module.enabled}
              @change=${(e: Event) =>
                this.handleToggleModule(module.id, (e.target as HTMLInputElement).checked)}
            />
            <span class="toggle-slider"></span>
          </label>
          ${module.isUploaded
            ? html`
                <cw-button
                  variant="danger"
                  size="small"
                  @click=${() => this.handleRemoveModule(module.id)}
                >
                  Remove
                </cw-button>
              `
            : ''}
        </div>
      </div>
    `;
  }

  render() {
    const builtInModules = this.modules.filter((m) => m.isBuiltIn);
    const uploadedModules = this.modules.filter((m) => m.isUploaded);

    return html`
      <div class="header">
        <h1>Options</h1>
        <cw-button variant="secondary" @click=${this.handleBack}>Back</cw-button>
      </div>

      ${this.error ? html`<div class="error-message">${this.error}</div>` : ''}
      ${this.success ? html`<div class="success-message">${this.success}</div>` : ''}

      <section>
        <h2>Built-in Modules</h2>
        <div class="module-list">
          ${builtInModules.length > 0
            ? builtInModules.map((m) => this.renderModuleItem(m))
            : html`<div class="empty-state">No built-in modules found.</div>`}
        </div>
      </section>

      <section>
        <h2>Uploaded Modules</h2>
        <div class="module-list">
          ${uploadedModules.length > 0
            ? uploadedModules.map((m) => this.renderModuleItem(m))
            : html`<div class="empty-state">No uploaded modules yet.</div>`}
        </div>
      </section>

      <section>
        <h2>Upload Module</h2>
        <div class="upload-section">
          <p>Upload a JSON module pack file to add new races, classes, and more.</p>
          <input
            type="file"
            class="file-input"
            accept=".json"
            @change=${this.handleFileSelected}
          />
          <cw-button @click=${this.handleUploadClick}>Choose File</cw-button>
        </div>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'options-page': OptionsPage;
  }
}
