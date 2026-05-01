import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  isDarkMode = signal(true);

  constructor() {
    this.initTheme();
    
    // Automatically apply class to body/html when signal changes
    effect(() => {
      if (typeof document !== 'undefined') {
        if (this.isDarkMode()) {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
          localStorage.setItem('theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
          localStorage.setItem('theme', 'light');
        }
      }
    });
  }

  private initTheme() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'light') {
        this.isDarkMode.set(false);
      } else {
        this.isDarkMode.set(true); // Default to dark (our primary theme)
      }
    }
  }

  toggleTheme() {
    this.isDarkMode.update(v => !v);
  }
}
