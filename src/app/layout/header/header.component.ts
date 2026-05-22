import { Component, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BrandThemeService } from '../../core/services/brand-theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  template: `
    <header class="header">
      <div class="header-brand" [attr.aria-label]="theme().brand.name">
        <!-- <img [src]="theme().logos.main" [alt]="theme().brand.shortName" /> -->
        <span>
          <strong>{{ theme().brand.shortName }}</strong>
          <small>{{ theme().brand.tagline }}</small>
        </span>
      </div>
      <div class="header-actions">
        <div class="header-welcome">
          <span class="welcome-kicker">{{ greeting }}</span>
          <strong>Welcome back, {{ user?.name || 'User' }}</strong>
          <span class="welcome-time">
            <i class="pi pi-calendar"></i>
            {{ todayLabel }} &middot; {{ liveTime }}
          </span>
        </div>
        <span class="weather-pill"><i class="pi pi-sun"></i> 31&deg;C</span>
        @if (searchOpen) {
          <label class="search-field">
            <span class="sr-only">Search</span>
            <input type="search" placeholder="Search" autofocus />
            <i class="pi pi-search"></i>
          </label>
        } @else {
          <button type="button" class="icon-action soft" aria-label="Search" (click)="searchOpen = true">
            <i class="pi pi-search"></i>
          </button>
        }
        <div class="user-menu">
          <button type="button" class="user-card" (click)="menuOpen = !menuOpen" aria-label="Logged in user menu">
            <span class="avatar">{{ userInitials }}</span>
            <span class="user-copy">
              <strong>{{ user?.name || 'User' }}</strong>
              <small>{{ user?.role || 'Role' }}</small>
            </span>
            <i class="pi pi-chevron-down user-chevron" [class.open]="menuOpen"></i>
          </button>
          @if (menuOpen) {
            <div class="account-menu">
              <button type="button" (click)="goToProfile()">
                <i class="pi pi-user"></i>
                <span>Profile</span>
              </button>
              <button type="button">
                <i class="pi pi-inbox"></i>
                <span>Inbox</span>
              </button>
              <button type="button" (click)="goToSettings()">
                <i class="pi pi-cog"></i>
                <span>Settings</span>
              </button>
              <button type="button" (click)="logout()">
                <i class="pi pi-power-off"></i>
                <span>Sign Out</span>
              </button>
            </div>
          }
        </div>
      </div>
    </header>
  `,
  styles: [
    `
      @font-face {
        font-family: 'ethnocentric rg';
        src: url('https://static.wfonts.com/data/2016/06/04/ethnocentric/ethnocentric rg.ttf') format('truetype');
        font-display: swap;
      }

      .header {
        min-height: 64px;
        background: var(--app-header-bg, #ffffff);
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1.25rem;
        padding: 0 1.35rem 0 1.45rem;
        position: sticky;
        top: 0;
        z-index: 5;
        color: var(--app-text);
      }
      .header-actions {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        min-width: 0;
      }
      .header-brand {
        display: inline-flex;
        align-items: center;
        gap: 0.65rem;
        min-width: 0;
      }
      .header-brand img {
        width: 2.85rem;
        height: 2.85rem;
        object-fit: contain;
      }
      .header-brand span {
        display: grid;
        gap: 0.12rem;
        line-height: 1;
      }
      .header-brand strong {
        color: var(--rdg-primary);
        font-family: var(--brand-font);
        font-size: 1.05rem;
        letter-spacing: 0.03em;
      }
      .header-brand small {
        color: var(--rdg-accent);
        font-size: 0.72rem;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        white-space: nowrap;
      }
      .header-welcome {
        display: grid;
        gap: 0.1rem;
        min-width: 0;
        margin-right: 0.55rem;
        text-align: right;
      }
      .welcome-kicker {
        color: var(--rdg-primary);
        font-size: 0.64rem;
        font-weight: 900;
        letter-spacing: 0.12em;
        line-height: 1;
        text-transform: uppercase;
      }
      .header-welcome strong {
        color: var(--app-text);
        font-size: 1.05rem;
        font-weight: 900;
        line-height: 1.2;
        white-space: nowrap;
      }
      .welcome-time {
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.4rem;
        color: var(--app-muted);
        font-size: 0.78rem;
        font-weight: 800;
        line-height: 1.2;
        white-space: nowrap;
      }
      .welcome-time i {
        color: var(--rdg-accent);
        font-size: 0.95rem;
        font-weight: 700;
        text-shadow: 0 0 0 currentColor;
      }
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
      }
      .icon-action {
        display: inline-grid;
        place-items: center;
        width: 2.55rem;
        height: 2.55rem;
        border: 1px solid rgba(72, 125, 182, 0.18);
        border-radius: 50%;
        color: var(--rdg-ink);
        background: #ffffff;
        font: inherit;
        cursor: pointer;
        box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
      }
      .icon-action i {
        color: currentColor;
        font-size: 1.22rem;
        font-weight: 800;
        text-shadow: 0 0 0 currentColor;
      }
      .weather-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        min-height: 2.35rem;
        border: 1px solid var(--app-border);
        border-radius: 999px;
        padding: 0 0.7rem;
        color: var(--app-text);
        background: var(--app-surface-soft);
        font-size: 0.82rem;
        font-weight: 800;
      }
      .weather-pill i {
        color: var(--rdg-accent);
        font-size: 1.08rem;
        font-weight: 800;
        text-shadow: 0 0 0 currentColor;
      }
      .icon-action.soft {
        color: var(--rdg-ink);
        background: #ffffff;
      }
      .icon-action:hover,
      .user-card:hover {
        transform: translateY(-1px);
      }
      .search-field {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        width: min(23.5rem, 36vw);
        height: 2.9rem;
        border: 1px solid var(--app-border);
        border-radius: 999px;
        padding: 0 1rem 0 1.15rem;
        background: var(--app-input-bg);
      }
      .search-field input {
        width: 100%;
        min-width: 0;
        border: 0;
        outline: 0;
        color: var(--app-text);
        background: transparent;
        font-size: 1.05rem;
      }
      .search-field input::placeholder {
        color: var(--app-muted);
        opacity: 1;
      }
      .search-field i {
        color: var(--rdg-ink);
        font-size: 1.22rem;
        font-weight: 800;
        text-shadow: 0 0 0 currentColor;
      }
      .user-menu {
        position: relative;
      }
      .user-card {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        min-height: 2.5rem;
        padding: 0;
        border: 0;
        background: transparent;
        cursor: pointer;
        font: inherit;
      }
      .avatar {
        display: grid;
        place-items: center;
        width: 2.35rem;
        height: 2.35rem;
        border-radius: 50%;
        color: #ffffff;
        background: linear-gradient(135deg, var(--rdg-primary), var(--rdg-accent));
        font-size: 0.78rem;
        font-weight: 900;
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35);
      }
      .user-copy {
        display: grid;
        gap: 0.12rem;
        line-height: 1;
      }
      .user-copy strong {
        color: var(--app-text);
        font-size: 0.82rem;
        font-weight: 900;
      }
      .user-copy small {
        color: var(--app-muted);
        font-size: 0.68rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }
      .user-chevron {
        color: var(--rdg-ink);
        font-size: 0.9rem;
        font-weight: 800;
        transition: transform 160ms ease;
      }
      .user-chevron.open {
        transform: rotate(180deg);
      }
      .account-menu {
        position: absolute;
        top: calc(100% + 0.9rem);
        right: 0;
        width: 13.2rem;
        padding: 0.9rem;
        border: 1px solid var(--app-border);
        border-radius: 0.7rem;
        background: var(--app-surface);
        box-shadow: 0 16px 34px rgba(15, 23, 42, 0.15);
        z-index: 20;
      }
      .account-menu button {
        display: flex;
        align-items: center;
        gap: 1rem;
        width: 100%;
        min-height: 2.7rem;
        border: 0;
        border-radius: 0.5rem;
        padding: 0 0.7rem;
        color: var(--app-text);
        background: transparent;
        font: inherit;
        font-size: 1rem;
        cursor: pointer;
        text-align: left;
      }
      .account-menu button:hover {
        background: var(--app-hover-bg);
        color: var(--rdg-primary);
      }
      .account-menu i {
        width: 1.2rem;
        font-size: 1.05rem;
      }
      @media (max-width: 700px) {
        .header {
          padding: 0 0.8rem 0 1rem;
        }
        .header-brand span,
        .welcome-kicker,
        .welcome-time,
        .weather-pill {
          display: none;
        }
        .user-copy,
        .user-chevron {
          display: none;
        }
        .search-field {
          width: min(13rem, 42vw);
        }
        .account-menu {
          right: -0.5rem;
        }
      }
    `
  ]
})
export class HeaderComponent implements OnDestroy {
  private auth = inject(AuthService);
  private router = inject(Router);
  private brandTheme = inject(BrandThemeService);
  theme = this.brandTheme.theme;
  user = this.auth.currentUser();
  menuOpen = false;
  searchOpen = false;
  now = new Date();
  private timer = window.setInterval(() => {
    this.now = new Date();
  }, 1000);

  get todayLabel(): string {
    return new Intl.DateTimeFormat('en-IN', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(this.now);
  }

  get liveTime(): string {
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(this.now);
  }

  get greeting(): string {
    const hour = this.now.getHours();

    if (hour < 12) {
      return 'Good morning';
    }

    if (hour < 17) {
      return 'Good afternoon';
    }

    return 'Good evening';
  }

  get userInitials(): string {
    const source = this.user?.name || this.user?.role || 'User';
    return source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/auth/login');
  }

  goToSettings(): void {
    this.menuOpen = false;
    this.router.navigateByUrl('/settings');
  }

  goToProfile(): void {
    this.menuOpen = false;
    this.router.navigateByUrl('/profile');
  }

  ngOnDestroy(): void {
    window.clearInterval(this.timer);
  }
}
