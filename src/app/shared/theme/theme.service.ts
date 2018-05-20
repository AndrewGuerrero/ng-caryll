import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  isDark: boolean = false;
  theme: string = "purple";
  defaultTheme: string = "purple";

  setTheme(theme: string) {
    this.theme = theme;
    if (theme === this.defaultTheme && !this.isDark) {
      this.removeTheme();
    } else {
      const contrast = this.isDark ? "dark" : "light";
      const href = `assets/${contrast}-${theme}.css`;
      getLinkElementForKey('theme').setAttribute('href', href);
    }
  }

  toggleTheme() {
    this.isDark = !this.isDark;
    console.log(this.isDark, this.theme);
    this.setTheme(this.theme);
  }

  private removeTheme() {
    const existingLinkElement = getExistingLinkElementByKey('theme');
    if (existingLinkElement) {
      document.head.removeChild(existingLinkElement);
    }
  }
}

function getLinkElementForKey(key: string) {
  return getExistingLinkElementByKey(key) || createLinkElementWithKey(key);
}
function getExistingLinkElementByKey(key: string) {
  return document.head.querySelector(`link[rel="stylesheet"].${getClassNameForKey(key)}`);
}

function createLinkElementWithKey(key: string) {
  console.log("create link");
  const linkEl = document.createElement('link');
  linkEl.setAttribute('rel', 'stylesheet');
  linkEl.classList.add(getClassNameForKey(key));
  document.head.appendChild(linkEl);
  return linkEl;
}

function getClassNameForKey(key: string) {
  return `ngc-${key}`;
}
