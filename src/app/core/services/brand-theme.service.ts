import { Injectable, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { LocalStorageService } from './local-storage.service';

export type BrandThemeMode = 'light';

export interface BrandTheme {
  version: number;
  organizationId: string;
  brand: {
    name: string;
    shortName: string;
    tagline: string;
    websiteUrl: string;
    supportEmail: string;
    supportPhone: string;
  };
  logos: {
    main: string;
    compact: string;
    dark: string;
    light: string;
    favicon: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    sidebarBackground: string;
    headerBackground: string;
    cardBackground: string;
    buttonColor: string;
    success: string;
    warning: string;
    danger: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    heroGradient: string;
  };
  typography: {
    brandFont: string;
    headingFont: string;
    bodyFont: string;
    customFontName: string;
    customFontDataUrl: string;
  };
  mode: BrandThemeMode;
}

export const BRAND_THEME_KEY = 'gym_brand_theme';
const DEFAULT_LOGO_URL = 'assets/icon/RDG/RDG%20LOGO.png';
const LEGACY_LOGO_URL = 'assets/RDG-logo-transparent.png';

export const RDG_LIGHT_COLORS: BrandTheme['colors'] = {
  primary: '#487DB6',
  secondary: '#3F70A5',
  accent: '#DC7B2A',
  sidebarBackground: '#FFFFFF',
  headerBackground: '#FFFFFF',
  cardBackground: '#FFFFFF',
  buttonColor: '#DC7B2A',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#DC2626',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  border: '#D8E1EC',
  heroGradient: 'linear-gradient(135deg, #487DB6 0%, #3F70A5 48%, #DC7B2A 100%)'
};

export const DEFAULT_BRAND_THEME: BrandTheme = {
  version: 1,
  organizationId: 'default',
  brand: {
    name: 'RDG Gym Management',
    shortName: 'RDG',
    tagline: 'Gym Management',
    websiteUrl: '',
    supportEmail: 'admin@rdggym.com',
    supportPhone: ''
  },
  logos: {
    main: DEFAULT_LOGO_URL,
    compact: DEFAULT_LOGO_URL,
    dark: DEFAULT_LOGO_URL,
    light: DEFAULT_LOGO_URL,
    favicon: DEFAULT_LOGO_URL
  },
  colors: RDG_LIGHT_COLORS,
  typography: {
    brandFont: 'Ethnocentric',
    headingFont: 'Orbitron',
    bodyFont: 'Rajdhani',
    customFontName: '',
    customFontDataUrl: ''
  },
  mode: 'light'
};

@Injectable({ providedIn: 'root' })
export class BrandThemeService {
  private storage = inject(LocalStorageService);
  private title = inject(Title);
  private themeSignal = signal<BrandTheme>(this.loadTheme());

  theme = this.themeSignal.asReadonly();

  constructor() {
    this.applyTheme(this.themeSignal());
  }

  updateDraft(theme: BrandTheme): void {
    const normalized = this.normalize(theme);
    this.themeSignal.set(normalized);
    this.applyTheme(normalized);
  }

  save(theme: BrandTheme = this.themeSignal()): void {
    const normalized = this.normalize(theme);
    this.storage.set(BRAND_THEME_KEY, normalized);
    this.updateDraft(normalized);
  }

  reset(): BrandTheme {
    this.storage.set(BRAND_THEME_KEY, DEFAULT_BRAND_THEME);
    this.updateDraft(DEFAULT_BRAND_THEME);
    return this.clone(DEFAULT_BRAND_THEME);
  }

  exportTheme(theme: BrandTheme = this.themeSignal()): string {
    return JSON.stringify(this.normalize(theme), null, 2);
  }

  importTheme(raw: string): BrandTheme {
    const parsed = JSON.parse(raw) as Partial<BrandTheme>;
    const normalized = this.normalize(parsed);
    this.save(normalized);
    return this.clone(normalized);
  }

  clone(theme: BrandTheme): BrandTheme {
    return JSON.parse(JSON.stringify(theme)) as BrandTheme;
  }

  private loadTheme(): BrandTheme {
    return this.normalize(this.storage.get<BrandTheme>(BRAND_THEME_KEY, DEFAULT_BRAND_THEME));
  }

  private normalize(value: Partial<BrandTheme>): BrandTheme {
    const colors = this.normalizeColors(value.colors);

    return {
      ...DEFAULT_BRAND_THEME,
      ...value,
      brand: this.normalizeBrand(value.brand),
      logos: this.normalizeLogos(value.logos),
      colors,
      typography: { ...DEFAULT_BRAND_THEME.typography, ...value.typography },
      mode: 'light'
    };
  }

  private normalizeColors(colors: Partial<BrandTheme['colors']> | undefined): BrandTheme['colors'] {
    if (this.isLegacyRdgBlueOrange(colors) || this.isLegacyDarkTheme(colors)) {
      return { ...RDG_LIGHT_COLORS };
    }

    return { ...DEFAULT_BRAND_THEME.colors, ...colors };
  }

  private isLegacyDarkTheme(colors: Partial<BrandTheme['colors']> | undefined): boolean {
    if (!colors) {
      return false;
    }

    return ['#0B0F19', '#020814', '#020610', '#06120b', '#0f0f10'].includes(colors.sidebarBackground ?? '');
  }

  private isLegacyRdgBlueOrange(colors: Partial<BrandTheme['colors']> | undefined): boolean {
    return colors?.primary === '#1565C0' && colors?.accent === '#FF6F00' && colors?.buttonColor === '#FB8500';
  }

  private normalizeLogos(logos: Partial<BrandTheme['logos']> | undefined): BrandTheme['logos'] {
    const normalized = { ...DEFAULT_BRAND_THEME.logos, ...logos };

    return {
      main: normalized.main === LEGACY_LOGO_URL ? DEFAULT_LOGO_URL : normalized.main,
      compact: normalized.compact === LEGACY_LOGO_URL ? DEFAULT_LOGO_URL : normalized.compact,
      dark: normalized.dark === LEGACY_LOGO_URL ? DEFAULT_LOGO_URL : normalized.dark,
      light: normalized.light === LEGACY_LOGO_URL ? DEFAULT_LOGO_URL : normalized.light,
      favicon: normalized.favicon === LEGACY_LOGO_URL ? DEFAULT_LOGO_URL : normalized.favicon
    };
  }

  private normalizeBrand(brand: Partial<BrandTheme['brand']> | undefined): BrandTheme['brand'] {
    const normalized = { ...DEFAULT_BRAND_THEME.brand, ...brand };

    return {
      ...normalized,
      name: normalized.name === 'RDG Gym Management' || normalized.name === 'RDG GYM' ? DEFAULT_BRAND_THEME.brand.name : normalized.name,
      shortName: normalized.shortName === 'RDG' ? DEFAULT_BRAND_THEME.brand.shortName : normalized.shortName,
      supportEmail: normalized.supportEmail === 'admin@RDG.com' ? DEFAULT_BRAND_THEME.brand.supportEmail : normalized.supportEmail
    };
  }

  private applyTheme(theme: BrandTheme): void {
    const root = document.documentElement;
    const lightTheme = this.normalize({ ...theme, mode: 'light', colors: this.normalizeColors(theme.colors) });
    const surface = lightTheme.colors.cardBackground;
    const background = '#F4F7FB';

    root.dataset['themeMode'] = 'light';
    root.classList.remove('theme-dark');
    root.classList.add('theme-light');
    root.style.setProperty('--rdg-primary', lightTheme.colors.primary);
    root.style.setProperty('--rdg-primary-strong', lightTheme.colors.buttonColor);
    root.style.setProperty('--rdg-primary-soft', `${lightTheme.colors.primary}22`);
    root.style.setProperty('--rdg-accent', lightTheme.colors.accent);
    root.style.setProperty('--rdg-accent-soft', `${lightTheme.colors.accent}1f`);
    root.style.setProperty('--rdg-ink', lightTheme.colors.textPrimary);
    root.style.setProperty('--rdg-teal', lightTheme.colors.secondary);
    root.style.setProperty('--app-bg', background);
    root.style.setProperty('--app-surface', surface);
    root.style.setProperty('--app-surface-soft', '#F8FAFC');
    root.style.setProperty('--app-text', lightTheme.colors.textPrimary);
    root.style.setProperty('--app-muted', lightTheme.colors.textSecondary);
    root.style.setProperty('--app-border', lightTheme.colors.border);
    root.style.setProperty('--app-sidebar-bg', lightTheme.colors.sidebarBackground);
    root.style.setProperty('--app-header-bg', lightTheme.colors.headerBackground);
    root.style.setProperty('--app-success', lightTheme.colors.success);
    root.style.setProperty('--app-warning', lightTheme.colors.warning);
    root.style.setProperty('--app-danger', lightTheme.colors.danger);
    root.style.setProperty('--app-hero', lightTheme.colors.heroGradient);
    root.style.setProperty('--app-primary-action', lightTheme.colors.primary);
    root.style.setProperty('--app-secondary-action', lightTheme.colors.buttonColor);
    root.style.setProperty('--rdg-silver-gradient', 'linear-gradient(135deg, #FFFFFF, #BFC7D5)');
    root.style.setProperty('--app-table-header', '#F8FAFC');
    root.style.setProperty('--app-input-bg', '#FFFFFF');
    root.style.setProperty('--app-hover-bg', '#EFF6FF');
    root.style.setProperty('--app-chart-grid', '#E5EDF6');
    root.style.setProperty('--brand-font', this.fontStack(lightTheme.typography.brandFont));
    root.style.setProperty('--heading-font', this.fontStack(lightTheme.typography.headingFont));
    root.style.setProperty('--body-font', this.fontStack(lightTheme.typography.bodyFont));
    document.body.style.fontFamily = this.fontStack(lightTheme.typography.bodyFont);

    this.loadGoogleFont(lightTheme.typography.brandFont);
    this.loadGoogleFont(lightTheme.typography.headingFont);
    this.loadGoogleFont(lightTheme.typography.bodyFont);
    if ([lightTheme.typography.brandFont, lightTheme.typography.headingFont, lightTheme.typography.bodyFont].includes('Ethnocentric')) {
      this.loadEthnocentric();
    }
    this.loadCustomFont(lightTheme);
    this.setFavicon(lightTheme.logos.favicon || lightTheme.logos.compact || lightTheme.logos.main);
    this.title.setTitle(lightTheme.brand.name);
  }

  private fontStack(font: string): string {
    return font ? `'${font}', Inter, 'Segoe UI', sans-serif` : `Inter, 'Segoe UI', sans-serif`;
  }

  private loadGoogleFont(font: string): void {
    if (!font || font === 'Inter' || font === 'Ethnocentric' || font.startsWith('Custom:')) {
      return;
    }

    const id = `brand-font-${font.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    if (document.getElementById(id)) {
      return;
    }

    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${font.replaceAll(' ', '+')}:wght@400;500;600;700;800&display=swap`;
    document.head.appendChild(link);
  }

  private loadEthnocentric(): void {
    const id = 'brand-font-ethnocentric';
    if (document.getElementById(id)) {
      return;
    }

    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      @font-face {
        font-family: 'Ethnocentric';
        src: url('https://static.wfonts.com/data/2016/06/04/ethnocentric/ethnocentric rg.ttf') format('truetype');
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
  }

  private loadCustomFont(theme: BrandTheme): void {
    const { customFontName, customFontDataUrl } = theme.typography;
    if (!customFontName || !customFontDataUrl || !('FontFace' in window)) {
      return;
    }

    const face = new FontFace(customFontName, `url(${customFontDataUrl})`);
    face.load().then((loaded) => document.fonts.add(loaded)).catch(() => undefined);
  }

  private setFavicon(href: string): void {
    if (!href) {
      return;
    }

    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = href;
  }
}
