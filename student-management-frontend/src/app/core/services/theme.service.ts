import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'sms-app-theme';
  currentTheme = signal<Theme>(this.getInitialTheme());

  constructor() {
    this.applyTheme(this.currentTheme());
  }

  toggleTheme(): void {
    const nextTheme: Theme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.currentTheme.set(nextTheme);
    localStorage.setItem(this.THEME_KEY, nextTheme);
    this.applyTheme(nextTheme);
  }

  private getInitialTheme(): Theme {
    const saved = localStorage.getItem(this.THEME_KEY) as Theme;
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.setAttribute('data-bs-theme', theme);
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${theme}`);
  }
}

