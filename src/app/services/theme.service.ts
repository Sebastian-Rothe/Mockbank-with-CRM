import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Signal for reactive theme state
  isDarkMode = signal<boolean>(false);

  constructor() {
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialDarkMode = savedTheme === 'dark' || (!savedTheme && prefersDark);
    this.isDarkMode.set(initialDarkMode);

    // Apply theme on initialization
    this.applyTheme(initialDarkMode);

    // Effect to apply theme when signal changes
    effect(() => {
      this.applyTheme(this.isDarkMode());
    });
  }

  /**
   * Toggle between light and dark mode
   */
  toggleTheme(): void {
    this.isDarkMode.update(dark => !dark);
  }

  /**
   * Set theme explicitly
   */
  setTheme(isDark: boolean): void {
    this.isDarkMode.set(isDark);
  }

  /**
   * Apply theme to document
   */
  private applyTheme(isDark: boolean): void {
    const body = document.body;
    
    if (isDark) {
      body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }

  /**
   * Get current theme
   */
  getCurrentTheme(): 'light' | 'dark' {
    return this.isDarkMode() ? 'dark' : 'light';
  }
}
