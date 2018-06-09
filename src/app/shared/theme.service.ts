import { Injectable } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';

@Injectable()
export class ThemeService {
  contrast: string;
  theme: string;

  static storageKey = 'ngc-theme-dark';

  constructor(private overlayContainer: OverlayContainer) {
    this.contrast = window.localStorage.getItem(ThemeService.storageKey) || 'light';
  }

  setTheme(theme: string) {
    this.theme = theme;
    const themeClass = `${this.contrast}-${this.theme}-theme`;
    this.addThemeToElement(themeClass, this.overlayContainer.getContainerElement());
    this.addThemeToElement(themeClass, document.body);
  }

  toggleTheme() {
    if (this.contrast === 'dark') {
      this.contrast = 'light';
    } else {
      this.contrast = 'dark';
    }
    window.localStorage.setItem(ThemeService.storageKey, this.contrast);
    this.setTheme(this.theme);
  }

  private addThemeToElement(themeClass: string, element: HTMLElement) {
    const elementClasses = element.classList;
    const elementClassesToRemove = Array.from(elementClasses)
      .filter((item: string) => item.includes('-theme'));
    if (elementClassesToRemove.length) {
      elementClasses.remove(...elementClassesToRemove);
    }
    elementClasses.add(themeClass);
  }
}