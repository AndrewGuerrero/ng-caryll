import { Component, OnInit, Input, Inject, ElementRef } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';

interface Link {
  id: string;
  type: string;
  active: boolean;
  name: string;
  top: number;
}

@Component({
  selector: 'ngc-table-of-contents',
  templateUrl: './table-of-contents.component.html',
  styleUrls: ['./table-of-contents.component.scss']
})
export class TableOfContentsComponent implements OnInit {
  @Input() links: Link[] = [];
  @Input() container: string;
  @Input() headerSelectors = '.ngc-markdown-h3, .ngc-markdown-h4';

  rootUrl = this.router.url.split('#')[0];
  private scrollContainer: any;
  private destroyed = new Subject();
  private urlFragment = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    @Inject(DOCUMENT) private _document: Document,
    private element: ElementRef,
  ) {
    this.router.events.pipe(takeUntil(this.destroyed)).subscribe(event => {
      if (event instanceof NavigationEnd) {
        const rootUrl = router.url.split('#')[0];
        if (rootUrl !== this.rootUrl) {
          this.links = this.createLinks();
          this.rootUrl = rootUrl;
        }
      }
    });

    this.route.fragment.pipe(takeUntil(this.destroyed)).subscribe(fragment => {
      this.urlFragment = fragment;

      const target = document.getElementById(this.urlFragment);
      if (target) {
        target.scrollIntoView();
      }
    });
  }

  ngOnInit(): void {
    Promise.resolve().then(() => {
      this.scrollContainer = this.container ? this._document.querySelectorAll(this.container)[0] : window;

      console.log(this.scrollContainer)
      if (this.scrollContainer) {
        fromEvent(this.scrollContainer, 'scroll').pipe(
          takeUntil(this.destroyed), debounceTime(10)).subscribe(() => {
            console.log("scrolled");
            this.onScroll();
          });
      }
    });
  }

  updateScrollPosition(): void {
    this.links = this.createLinks()

    const target = document.getElementById(this.urlFragment);
    if (target) {
      target.scrollIntoView();
    }
  }

  private createLinks(): Link[] {
    const links = [];
    const headers = Array.from(this._document.querySelectorAll(this.headerSelectors)) as HTMLElement[];

    if (headers.length) {
      for (const header of headers) {
        const name = header.innerText.trim().replace(/^link/, '');
        const { top } = header.getBoundingClientRect();
        links.push({
          id: header.id,
          type: header.tagName.toLowerCase(),
          active: false,
          name: name,
          top: top,
        });
      }
    }
    return links;
  }

  private onScroll(): void {
    for (let i = 0; i < this.links.length; i++) {
      this.links[i].active = this.isLinkActive(this.links[i], this.links[i + 1]);
    }
  }

  private isLinkActive(currentLink: any, nextLink: any): boolean {
    const scrollOffset = this.getScrollOffset();
    console.log(scrollOffset);
    return scrollOffset >= currentLink.top && (!nextLink && nextLink.top < scrollOffset);
  }

  private getScrollOffset(): number {
    const { top } = this.element.nativeElement.getBoundingClientRect();
    if (typeof this.scrollContainer.scrollTop !== 'undefined') {
      return this.scrollContainer.scrollTop + top;
    } else if (typeof this.scrollContainer.pageYOffset !== 'undefined') {
      return this.scrollContainer.pageYOffset + top;
    }
  }
}
