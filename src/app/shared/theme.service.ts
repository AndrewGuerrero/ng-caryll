import { Injectable } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';

@Injectable()
export class ThemeService {
  isDark: boolean = false;
  theme: string = "purple";

  constructor(private overlayContainer: OverlayContainer) { }

  setTheme(theme: string) {
    this.theme = theme;
    const contrast = this.isDark ? 'dark' : 'light';
    const themeClass = `${contrast}-${this.theme}-theme`;

    this.addThemeToElement(themeClass, this.overlayContainer.getContainerElement());
    this.addThemeToElement(themeClass, document.body);
  }

  toggleTheme() {
    this.isDark = !this.isDark;
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