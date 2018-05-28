import { Injectable, Inject } from '@angular/core';
import { Observable, ReplaySubject, fromEvent, Subject } from 'rxjs';
import { auditTime, takeUntil, distinctUntilChanged } from 'rxjs/operators';
import { group } from '@angular/animations';
import { ScrollService } from './scroll.service';
import { DOCUMENT } from '@angular/platform-browser';

export interface ScrollItem {
  element: Element;
  index: number;
}

export interface ScrollSpyInfo {
  active: Observable<ScrollItem | null>;
  unspy: () => void;
}

@Injectable()
export class ScrollSpyService {
  private spiedElementGroups: ScrollSpiedElementGroup[] = [];
  private stopListening = new Subject();
  private resizeEvents = fromEvent(window, 'resize').pipe(auditTime(300), takeUntil(this.stopListening));
  private scrollEvents = fromEvent(window, 'scroll').pipe(auditTime(10), takeUntil(this.stopListening));
  private lastMaxScrollTop: number;
  private lastContentHeight: number;

  constructor(
    @Inject(DOCUMENT) private doc: any,
    private scrollService: ScrollService
  ) { }

  spyOn(elements: Element[]): ScrollSpyInfo {
    if (!this.spiedElementGroups.length) {
      this.resizeEvents.subscribe(() => this.onResize());
      this.scrollEvents.subscribe(() => this.onScroll());
      this.onResize();
    }

    const scrollTop = this.getScrollTop();
    const topOffset = this.getTopOffset();
    const maxScrollTop = this.lastMaxScrollTop;

    const spiedGroup = new ScrollSpiedElementGroup(elements);
    spiedGroup.calibrate(scrollTop, topOffset);
    spiedGroup.onScroll(scrollTop, maxScrollTop);

    this.spiedElementGroups.push(spiedGroup);

    return {
      active: spiedGroup.activeScrollItem.asObservable().pipe(distinctUntilChanged()),
      unspy: () => this.unspy(spiedGroup),
    };
  }

  private unspy(spiedGroup: ScrollSpiedElementGroup) {
    spiedGroup.activeScrollItem.complete();
    this.spiedElementGroups = this.spiedElementGroups.filter(group => group !== spiedGroup);

    if (!this.spiedElementGroups.length) {
      this.stopListening.next();
    }
  }

  private getScrollTop() {
    return window && window.pageYOffset || 0;
  }

  private getTopOffset() {
    return this.scrollService.topOffset + 50;
  }

  private getContentHeight() {
    return this.doc.body.scrollHeight || Number.MAX_SAFE_INTEGER;
  }

  private getViewportHeight() {
    return this.doc.body.clientHeight || 0;
  }

  private onResize() {
    const contentHeight = this.getContentHeight();
    const viewportHeight = this.getViewportHeight();
    const scrollTop = this.getScrollTop();
    const topOffset = this.getTopOffset();

    this.lastContentHeight = contentHeight;
    this.lastMaxScrollTop = contentHeight - viewportHeight;

    this.spiedElementGroups.forEach(group => group.calibrate(scrollTop, topOffset));
  }

  private onScroll() {
    if (this.lastContentHeight !== this.getContentHeight()) {
      this.onResize();
    }

    const scrollTop = this.getScrollTop();
    const maxScrollTop = this.lastMaxScrollTop;
    this.spiedElementGroups.forEach(group => group.onScroll(scrollTop, maxScrollTop));
  }
}


class ScrollSpiedElementGroup {
  activeScrollItem: ReplaySubject<ScrollItem | null> = new ReplaySubject(1);
  private spiedElements: ScrollSpiedElement[];

  constructor(private elements: Element[]) {
    this.spiedElements = elements.map((elem, i) => new ScrollSpiedElement(elem, i));
  }

  calibrate(scrollTop: number, topOffset: number) {
    this.spiedElements.forEach(spiedElem => spiedElem.calculateTop(scrollTop, topOffset));
    this.spiedElements.sort((a, b) => b.top - a.top);
  }

  onScroll(scrollTop: number, maxScrollTop: number) {
    let activeItem: ScrollItem | undefined;

    if (scrollTop + 1 >= maxScrollTop) {
      activeItem = this.spiedElements[0];
    } else {
      this.spiedElements.some(spiedElem => {
        if (spiedElem.top <= scrollTop) {
          activeItem = spiedElem;
          return true;
        }
        return false;
      });
    }
    this.activeScrollItem.next(activeItem || null);
  }
}

class ScrollSpiedElement implements ScrollItem {
  top = 0;

  constructor(public readonly element: Element, public readonly index: number) { }

  calculateTop(scrollTop: number, topOffset: number) {
    this.top = scrollTop + this.element.getBoundingClientRect().top - topOffset;
  }
}