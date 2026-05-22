import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrandTheme, BrandThemeMode, BrandThemeService, DEFAULT_BRAND_THEME, RDG_LIGHT_COLORS } from '../../../../core/services/brand-theme.service';
import { ToastService } from '../../../../shared/services/toast.service';

type LogoKey = keyof BrandTheme['logos'];
type ColorKey = keyof BrandTheme['colors'];

interface ColorControl {
  key: ColorKey;
  label: string;
  gradient?: boolean;
}

const BRAND_PRESETS: Array<{ name: string; theme: Pick<BrandTheme, 'colors' | 'mode'> }> = [
  { name: 'RDG Premium Light', theme: { mode: 'light', colors: RDG_LIGHT_COLORS } },
  {
    name: 'Modern Blue Orange',
    theme: {
      mode: 'light',
      colors: RDG_LIGHT_COLORS
    }
  },
  {
    name: 'Wellness Teal',
    theme: {
      mode: 'light',
      colors: {
        ...DEFAULT_BRAND_THEME.colors,
        primary: '#0f766e',
        secondary: '#14b8a6',
        accent: '#0ea5e9',
        buttonColor: '#0f766e',
        heroGradient: 'linear-gradient(135deg, #0f766e 0%, #0891b2 55%, #14b8a6 100%)'
      }
    }
  },
  {
    name: 'Premium Purple',
    theme: {
      mode: 'light',
      colors: {
        ...DEFAULT_BRAND_THEME.colors,
        primary: '#7c3aed',
        secondary: '#4c1d95',
        accent: '#c026d3',
        buttonColor: '#7c3aed',
        heroGradient: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 55%, #c026d3 100%)'
      }
    }
  }
];

@Component({
  selector: 'app-brand-theme-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="brand-theme-page">
      <section class="theme-hero">
        <div>
          <span class="eyebrow">White Label Studio</span>
          <h2>Brand Theme Management</h2>
          <p>Customize identity, logos, colors, typography, and runtime theme behavior from one place.</p>
        </div>
        <div class="hero-actions">
          <button type="button" class="secondary" (click)="undoChanges()"><i class="pi pi-undo"></i> Undo</button>
          <button type="button" class="secondary" (click)="saveDraft()"><i class="pi pi-save"></i> Save Draft</button>
          <button type="button" (click)="saveTheme()"><i class="pi pi-check"></i> Apply Theme</button>
        </div>
      </section>

      <section class="theme-layout">
        <main class="theme-editor">
          <section class="page-card">
            <div class="section-heading">
              <div>
                <h3>Brand Information</h3>
                <p>These values can be reused by reports, invoices, membership cards, emails, and notifications.</p>
              </div>
            </div>
            <div class="form-grid">
              <label>Brand Name <input [(ngModel)]="draft.brand.name" (ngModelChange)="preview()" /></label>
              <label>Short Brand Name <input [(ngModel)]="draft.brand.shortName" (ngModelChange)="preview()" /></label>
              <label class="full">Tagline <input [(ngModel)]="draft.brand.tagline" (ngModelChange)="preview()" /></label>
              <label>Website URL <input [(ngModel)]="draft.brand.websiteUrl" (ngModelChange)="preview()" /></label>
              <label>Support Email <input type="email" [(ngModel)]="draft.brand.supportEmail" (ngModelChange)="preview()" /></label>
              <label>Support Contact Number <input [(ngModel)]="draft.brand.supportPhone" (ngModelChange)="preview()" /></label>
            </div>
          </section>

          <section class="page-card">
            <div class="section-heading">
              <div>
                <h3>Logo Management</h3>
                <p>Upload, preview, replace, or reset brand assets. Images are resized before storing.</p>
              </div>
            </div>
            <div class="logo-grid">
              <article
                *ngFor="let logo of logoControls"
                class="logo-uploader"
                (dragover)="allowDrop($event)"
                (drop)="dropLogo($event, logo.key)"
              >
                <span>{{ logo.label }}</span>
                <img [src]="draft.logos[logo.key]" [alt]="logo.label" />
                <div class="logo-actions">
                  <label class="file-button">
                    Replace
                    <input type="file" accept="image/*" (change)="uploadLogo($event, logo.key)" />
                  </label>
                  <button type="button" class="secondary" (click)="resetLogo(logo.key)">Reset</button>
                </div>
                <small>Drag image here or use replace.</small>
              </article>
            </div>
          </section>

          <section class="page-card">
            <div class="section-heading">
              <div>
                <h3>Theme Colors</h3>
                <p>Use HEX values or gradients. Changes preview instantly across CSS variables and PrimeNG controls.</p>
              </div>
            </div>
            <div class="color-grid">
              <label *ngFor="let color of colorControls" class="color-field">
                <span>{{ color.label }}</span>
                <div class="color-input-row">
                  <input *ngIf="!color.gradient" type="color" [ngModel]="draft.colors[color.key]" (ngModelChange)="setColor(color.key, $event)" />
                  <input [ngModel]="draft.colors[color.key]" (ngModelChange)="setColor(color.key, $event)" />
                </div>
              </label>
            </div>
          </section>

          <section class="page-card">
            <div class="section-heading">
              <div>
                <h3>Typography</h3>
                <p>Select Google fonts or upload a custom font file for brand usage.</p>
              </div>
            </div>
            <div class="form-grid">
              <label>Brand Font <select [(ngModel)]="draft.typography.brandFont" (ngModelChange)="preview()"><option *ngFor="let font of fonts">{{ font }}</option></select></label>
              <label>Heading Font <select [(ngModel)]="draft.typography.headingFont" (ngModelChange)="preview()"><option *ngFor="let font of fonts">{{ font }}</option></select></label>
              <label>Body Font <select [(ngModel)]="draft.typography.bodyFont" (ngModelChange)="preview()"><option *ngFor="let font of fonts">{{ font }}</option></select></label>
              <label>Custom Font Upload <input type="file" accept=".ttf,.otf,.woff,.woff2" (change)="uploadFont($event)" /></label>
            </div>
            <div class="font-preview">
              <strong [style.fontFamily]="fontStack(draft.typography.headingFont)">Train Beyond Limits</strong>
              <span [style.fontFamily]="fontStack(draft.typography.bodyFont)">Memberships, payments, reports, and attendance will use the selected brand typography.</span>
            </div>
          </section>

          <section class="page-card">
            <div class="section-heading">
              <div>
                <h3>Preset Theme Templates</h3>
                <p>Apply a preset, then fine-tune logos, colors, and fonts.</p>
              </div>
            </div>
            <div class="preset-grid">
              <button *ngFor="let preset of presets" type="button" (click)="applyPreset(preset.name)">
                <span>{{ preset.name }}</span>
                <em [style.background]="preset.theme.colors.heroGradient"></em>
              </button>
            </div>
          </section>

          <section class="page-card">
            <div class="section-heading">
              <div>
                <h3>Mode, Import & Export</h3>
                <p>Backup, reuse, or prepare this theme package for future multi-brand support.</p>
              </div>
            </div>
            <div class="mode-row">
              <label *ngFor="let option of modeOptions" class="mode-option" [class.active]="draft.mode === option.value">
                <input type="radio" name="themeMode" [value]="option.value" [(ngModel)]="draft.mode" (change)="preview()" />
                <span>{{ option.label }}</span>
              </label>
            </div>
            <div class="import-export">
              <textarea rows="8" [(ngModel)]="themeJson" placeholder="Theme JSON import/export"></textarea>
              <div>
                <button type="button" class="secondary" (click)="exportTheme()"><i class="pi pi-download"></i> Export JSON</button>
                <button type="button" class="secondary" (click)="importTheme()"><i class="pi pi-upload"></i> Import JSON</button>
                <button type="button" class="danger" (click)="resetTheme()"><i class="pi pi-refresh"></i> Reset Default</button>
              </div>
            </div>
          </section>
        </main>

        <aside class="preview-panel page-card">
          <div class="section-heading">
            <div>
              <h3>Live Preview</h3>
              <p>Changes apply instantly before final save.</p>
            </div>
          </div>
          <div class="preview-shell">
            <div class="preview-sidebar">
              <img [src]="draft.logos.compact || draft.logos.main" alt="Brand preview" />
              <strong>{{ draft.brand.shortName }}</strong>
              <span>Dashboard</span>
              <span>Members</span>
              <span>Payments</span>
            </div>
            <div class="preview-main">
              <div class="preview-header">
                <strong>{{ draft.brand.name }}</strong>
                <button type="button">Action</button>
              </div>
              <div class="preview-hero">
                <span>{{ draft.brand.shortName }}</span>
                <h4>{{ draft.brand.tagline || 'Train Beyond Limits' }}</h4>
              </div>
              <div class="preview-cards">
                <article><small>Total Members</small><strong>0</strong></article>
                <article><small>Revenue</small><strong>Rs. 0</strong></article>
              </div>
              <table>
                <thead><tr><th>Name</th><th>Status</th></tr></thead>
                <tbody><tr><td>Preview Member</td><td><span>Active</span></td></tr></tbody>
              </table>
              <label class="preview-form">Form Field <input value="Theme preview" /></label>
            </div>
          </div>
        </aside>
      </section>
    </div>
  `,
  styles: [
    `
      .brand-theme-page,
      .theme-editor {
        display: grid;
        gap: 1rem;
      }

      .theme-hero,
      .section-heading,
      .hero-actions,
      .logo-actions,
      .mode-row,
      .import-export div {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .theme-hero {
        justify-content: space-between;
        padding: 1.2rem;
        border-radius: var(--app-radius);
        color: #fff;
        background: var(--app-hero);
      }

      h2,
      h3,
      h4,
      p {
        margin: 0;
      }

      .eyebrow {
        color: #ffe3c2;
        font-size: 0.76rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .theme-hero p,
      .section-heading p,
      .logo-uploader small,
      .font-preview span {
        color: var(--app-muted);
      }

      .theme-hero p {
        color: rgba(255, 255, 255, 0.86);
      }

      button,
      .file-button {
        border: 0;
        border-radius: 8px;
        padding: 0.68rem 0.9rem;
        background: var(--app-primary-action);
        color: #fff;
        font-weight: 800;
        cursor: pointer;
        text-decoration: none;
      }

      button.secondary,
      .file-button {
        border: 1px solid var(--app-border);
        background: var(--app-surface);
        color: var(--app-text);
      }

      button.danger {
        background: var(--app-danger);
      }

      .file-button input {
        display: none;
      }

      .theme-layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 420px;
        gap: 1rem;
        align-items: start;
      }

      .section-heading {
        justify-content: space-between;
        margin-bottom: 1rem;
      }

      .form-grid,
      .color-grid,
      .logo-grid,
      .preset-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.85rem;
      }

      .logo-grid,
      .preset-grid {
        grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
      }

      .full {
        grid-column: 1 / -1;
      }

      label {
        display: grid;
        gap: 0.35rem;
        color: var(--app-muted);
        font-size: 0.84rem;
        font-weight: 800;
      }

      input,
      select,
      textarea {
        width: 100%;
        border: 1px solid var(--app-border);
        border-radius: 8px;
        padding: 0.68rem 0.75rem;
        color: var(--app-text);
        background: var(--app-surface);
      }

      input[type='color'] {
        width: 3rem;
        min-width: 3rem;
        padding: 0.15rem;
      }

      .logo-uploader {
        display: grid;
        gap: 0.65rem;
        border: 1px dashed var(--app-border);
        border-radius: 10px;
        padding: 0.85rem;
        background: var(--app-surface-soft);
      }

      .logo-uploader > span {
        font-weight: 900;
      }

      .logo-uploader img {
        width: 100%;
        height: 96px;
        object-fit: contain;
        border-radius: 8px;
        background: #fff;
      }

      .color-input-row {
        display: flex;
        gap: 0.45rem;
      }

      .font-preview {
        display: grid;
        gap: 0.35rem;
        margin-top: 1rem;
        border: 1px solid var(--app-border);
        border-radius: 8px;
        padding: 1rem;
      }

      .font-preview strong {
        color: var(--app-text);
        font-size: 1.4rem;
      }

      .preset-grid button {
        display: grid;
        gap: 0.65rem;
        border: 1px solid var(--app-border);
        background: var(--app-surface);
        color: var(--app-text);
        text-align: left;
      }

      .preset-grid em {
        height: 38px;
        border-radius: 8px;
      }

      .mode-row {
        flex-wrap: wrap;
        margin-bottom: 1rem;
      }

      .mode-option {
        display: flex;
        width: auto;
        border: 1px solid var(--app-border);
        border-radius: 999px;
        padding: 0.5rem 0.75rem;
        background: var(--app-surface-soft);
      }

      .mode-option.active {
        border-color: var(--rdg-accent);
        color: var(--rdg-accent);
      }

      .mode-option input {
        width: auto;
      }

      .import-export {
        display: grid;
        gap: 0.75rem;
      }

      .import-export div {
        flex-wrap: wrap;
      }

      .preview-panel {
        position: sticky;
        top: 5rem;
      }

      .preview-shell {
        display: grid;
        grid-template-columns: 92px minmax(0, 1fr);
        overflow: hidden;
        border: 1px solid var(--app-border);
        border-radius: 12px;
      }

      .preview-sidebar {
        display: grid;
        align-content: start;
        gap: 0.75rem;
        min-height: 470px;
        padding: 0.8rem;
        color: var(--app-text);
        background: var(--app-sidebar-bg);
      }

      .preview-sidebar img {
        width: 42px;
        height: 42px;
        object-fit: contain;
      }

      .preview-sidebar span {
        border-radius: 7px;
        padding: 0.45rem;
        background: var(--rdg-accent-soft);
        color: var(--rdg-accent);
        font-size: 0.72rem;
        font-weight: 800;
      }

      .preview-main {
        display: grid;
        gap: 0.75rem;
        padding: 0.85rem;
        background: var(--app-bg);
      }

      .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-radius: 8px;
        padding: 0.65rem;
        background: var(--app-header-bg);
      }

      .preview-hero {
        border-radius: 10px;
        padding: 1rem;
        color: #fff;
        background: var(--app-hero);
      }

      .preview-hero span {
        font-size: 0.72rem;
        font-weight: 900;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .preview-cards {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.65rem;
      }

      .preview-cards article,
      .preview-form,
      table {
        border: 1px solid var(--app-border);
        border-radius: 8px;
        padding: 0.65rem;
        background: var(--app-surface);
      }

      table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
      }

      th,
      td {
        padding: 0.4rem;
        text-align: left;
      }

      td span {
        border-radius: 999px;
        padding: 0.2rem 0.45rem;
        background: color-mix(in srgb, var(--app-success) 18%, transparent);
        color: var(--app-success);
        font-size: 0.72rem;
        font-weight: 900;
      }

      @media (max-width: 1120px) {
        .theme-layout,
        .theme-hero,
        .form-grid,
        .color-grid {
          grid-template-columns: 1fr;
          display: grid;
        }

        .preview-panel {
          position: static;
        }
      }
    `
  ]
})
export class BrandThemeManagementComponent {
  private brandTheme = inject(BrandThemeService);
  private toast = inject(ToastService);

  draft = this.brandTheme.clone(this.brandTheme.theme());
  saved = this.brandTheme.clone(this.brandTheme.theme());
  themeJson = '';
  presets = BRAND_PRESETS;
  fonts = ['Ethnocentric', 'Orbitron', 'Rajdhani', 'Inter', 'Bebas Neue', 'Azonix', 'Montserrat', 'Poppins', 'Roboto Condensed', 'Oswald'];
  modeOptions: Array<{ label: string; value: BrandThemeMode }> = [
    { label: 'Light Mode', value: 'light' }
  ];
  logoControls: Array<{ key: LogoKey; label: string }> = [
    { key: 'main', label: 'Main Logo' },
    { key: 'compact', label: 'Compact Logo' },
    { key: 'light', label: 'Light Theme Logo' },
    { key: 'favicon', label: 'Favicon' }
  ];
  colorControls: ColorControl[] = [
    { key: 'primary', label: 'Primary Color' },
    { key: 'secondary', label: 'Secondary Color' },
    { key: 'accent', label: 'Accent Color' },
    { key: 'sidebarBackground', label: 'Sidebar Background' },
    { key: 'headerBackground', label: 'Header Background' },
    { key: 'cardBackground', label: 'Card Background' },
    { key: 'buttonColor', label: 'Button Color' },
    { key: 'success', label: 'Success Color' },
    { key: 'warning', label: 'Warning Color' },
    { key: 'danger', label: 'Danger/Error Color' },
    { key: 'textPrimary', label: 'Text Primary' },
    { key: 'textSecondary', label: 'Text Secondary' },
    { key: 'border', label: 'Border Color' },
    { key: 'heroGradient', label: 'Hero Gradient', gradient: true }
  ];

  preview(): void {
    this.brandTheme.updateDraft(this.draft);
  }

  saveTheme(): void {
    if (!this.draft.brand.name.trim()) {
      this.toast.error('Brand Name Required', 'Enter a brand name before applying the theme.');
      return;
    }

    if (confirm('Apply this brand theme across the application?')) {
      this.brandTheme.save(this.draft);
      this.saved = this.brandTheme.clone(this.draft);
      this.toast.success('Theme Applied', 'Brand theme has been applied across the application.');
    }
  }

  saveDraft(): void {
    this.brandTheme.save(this.draft);
    this.saved = this.brandTheme.clone(this.draft);
    this.toast.success('Draft Saved', 'Brand theme draft has been saved.');
  }

  undoChanges(): void {
    this.draft = this.brandTheme.clone(this.saved);
    this.preview();
    this.toast.success('Changes Reverted', 'Unsaved theme changes were reverted.');
  }

  resetTheme(): void {
    if (!confirm('Reset branding to the default RDG theme?')) {
      return;
    }

    this.draft = this.brandTheme.reset();
    this.saved = this.brandTheme.clone(this.draft);
    this.toast.success('Theme Reset', 'Default brand theme has been restored.');
  }

  applyPreset(name: string): void {
    const preset = this.presets.find((item) => item.name === name);
    if (!preset) {
      return;
    }
    this.draft = this.brandTheme.clone({
      ...this.draft,
      mode: preset.theme.mode,
      colors: { ...this.draft.colors, ...preset.theme.colors }
    });
    this.preview();
    this.toast.success('Preset Applied', `${name} preset is ready to customize.`);
  }

  exportTheme(): void {
    this.themeJson = this.brandTheme.exportTheme(this.draft);
    this.toast.success('Theme Exported', 'Theme JSON is ready.');
  }

  importTheme(): void {
    try {
      this.draft = this.brandTheme.importTheme(this.themeJson);
      this.saved = this.brandTheme.clone(this.draft);
      this.toast.success('Theme Imported', 'Imported theme has been applied.');
    } catch {
      this.toast.error('Invalid JSON', 'Paste a valid exported theme JSON.');
    }
  }

  setColor(key: ColorKey, value: string): void {
    this.draft.colors[key] = value;
    this.preview();
  }

  resetLogo(key: LogoKey): void {
    this.draft.logos[key] = DEFAULT_BRAND_THEME.logos[key];
    this.preview();
  }

  allowDrop(event: DragEvent): void {
    event.preventDefault();
  }

  dropLogo(event: DragEvent, key: LogoKey): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.readImage(file, key);
    }
  }

  uploadLogo(event: Event, key: LogoKey): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.readImage(file, key);
      input.value = '';
    }
  }

  uploadFont(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const fontName = file.name.replace(/\.(ttf|otf|woff2?|)$/i, '');
      this.draft.typography.customFontName = fontName;
      this.draft.typography.customFontDataUrl = String(reader.result || '');
      if (!this.fonts.includes(fontName)) {
        this.fonts = [fontName, ...this.fonts];
      }
      this.draft.typography.brandFont = fontName;
      this.preview();
      this.toast.success('Font Uploaded', `${fontName} is available for preview.`);
    };
    reader.readAsDataURL(file);
  }

  fontStack(font: string): string {
    return `'${font}', Inter, sans-serif`;
  }

  private readImage(file: File, key: LogoKey): void {
    if (!file.type.startsWith('image/')) {
      this.toast.error('Invalid Image', 'Upload a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => this.resizeImage(String(reader.result || ''), key);
    reader.readAsDataURL(file);
  }

  private resizeImage(dataUrl: string, key: LogoKey): void {
    const image = new Image();
    image.onload = () => {
      const maxSize = key === 'favicon' ? 128 : 512;
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext('2d');
      context?.drawImage(image, 0, 0, canvas.width, canvas.height);
      this.draft.logos[key] = canvas.toDataURL('image/png');
      this.preview();
      this.toast.success('Logo Updated', `${this.logoControls.find((item) => item.key === key)?.label} updated.`);
    };
    image.src = dataUrl;
  }
}
