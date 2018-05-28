import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { PlatformLocation } from '@angular/common';
import { fromEvent } from 'rxjs';

export const topMargin = 16;

@Injectable()
export class ScrollService {

  private _topOffset: number | null;
  private _topOfPageElement: Element;

  get topOffset() {
    if (!this._topOffset) {
      const navbar = this.document.querySelector('.ngc-navbar');
      this._topOffset = (navbar && navbar.clientHeight || 0) + topMargin;
    }
    return this._topOffset;
  }

  get topOfPageElement() {
    if (!this._topOfPageElement) {
      this._topOfPageElement = this.document.body;
    }
    return this._topOfPageElement;
  }

  constructor(
    @Inject(DOCUMENT) private document: any,
    private location: PlatformLocation
  ) {
    fromEvent(window, 'resize').subscribe(() => this._topOffset = null);
  }

  scroll() {
    const hash = this.getCurrentHash();
    const element: HTMLElement = hash ? this.document.getElementById(hash) : this.topOfPageElement;
    this.scrollToElement(element);
  }

  scrollToTop() {
    this.scrollToElement(this.topOfPageElement);
  }

  private getCurrentHash() {
    return decodeURIComponent(this.location.hash.replace(/^#/, ''));
  }

  private scrollToElement(element: Element | null) {
    if (element) {
      element.scrollIntoView();
      if (window && window.scrollBy) {
        window.scrollBy(0, element.getBoundingClientRect().top - this.topOffset);

        if (window.pageYOffset < 20) {
          window.scrollBy(0, -window.pageYOffset);
        }
      }
    }
  }
}
