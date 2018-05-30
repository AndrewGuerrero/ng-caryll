import { Injectable, Inject } from '@angular/core';
import { SafeHtml, DOCUMENT, DomSanitizer } from '@angular/platform-browser';
import { ReplaySubject } from 'rxjs';
import { ScrollSpyInfo, ScrollSpyService } from './scroll-spy.service';

export interface TocItem {
  content: SafeHtml;
  href: string;
  level: string;
  title: string;
}

@Injectable()
export class TableOfContentsService {
  tocList = new ReplaySubject<TocItem[]>(1);
  activeItemIndex = new ReplaySubject<number | null>(1);

  private scrollSpyInfo: ScrollSpyInfo | null = null;

  constructor(
    @Inject(DOCUMENT) private document: any,
    private domSanitizer: DomSanitizer,
    private scrollSpyService: ScrollSpyService) { }

  genToc(docElement?: Element, docId = '') {
    this.resetScrollSpyInfo();

    if (!docElement) {
      this.tocList.next([]);
      return;
    }

    const headings = this.findTocHeadings(docElement);
    const idMap = new Map<string, number>();
    const tocList = headings.map(heading => ({
      content: this.extractHeadingSafeHtml(heading),
      href: `${docId}#${this.getId(heading, idMap)}`,
      level: heading.tagName.toLowerCase(),
      title: (heading.textContent || '').trim().replace(/^link/, ''),
    }));

    this.tocList.next(tocList);

    this.scrollSpyInfo = this.scrollSpyService.spyOn(headings);
    this.scrollSpyInfo.active.subscribe(item => this.activeItemIndex.next(item && item.index));
  }

  reset() {
    this.resetScrollSpyInfo();
    this.tocList.next([]);
  }

  private findTocHeadings(docElement: Element): HTMLHeadingElement[] {
    return Array.from(docElement.querySelectorAll('h1,h2,h3'));
  }

  private extractHeadingSafeHtml(heading: HTMLHeadingElement) {
    const div: HTMLDivElement = this.document.createElement('div');
    div.innerHTML = heading.innerHTML;
    const anchorLinks: HTMLAnchorElement[] = Array.from(div.querySelectorAll('a'));
    anchorLinks.forEach((anchorLink) => {
      if (!anchorLink.classList.contains('header-link')) {
        const parent = anchorLink.parentNode!;
        while (anchorLink.childNodes.length) {
          parent.insertBefore(anchorLink.childNodes[0], anchorLink);
        }
      }
      anchorLink.remove();
    });

    return this.domSanitizer.bypassSecurityTrustHtml(div.innerHTML.trim());
  }

  private resetScrollSpyInfo() {

  }

  private getId(h: HTMLHeadingElement, idMap: Map<string, number>) {
    let id = h.id;
    if (id) {
      addToMap(id);
    } else {
      id = (h.textContent || '').trim().toLowerCase().replace(/\W+/g, '-');
      id = addToMap(id);
      h.id = id;
    }
    return id;

    function addToMap(key: string) {
      const oldCount = idMap.get(key) || 0;
      const count = oldCount + 1;
      idMap.set(key, count);
      return count === 1 ? key : `${key}-${count}`;
    }
  }
}
