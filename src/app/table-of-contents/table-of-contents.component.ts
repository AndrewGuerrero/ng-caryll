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
  @Input() headerSelectors = '.ngc-markdown h2, .ngc-markdown h3';

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
        this.updateScrollPosition();
      }
    });
  }

  ngOnInit(): void {
    Promise.resolve().then(() => {
      this.scrollContainer = this.container ? this._document.querySelectorAll(this.container)[0] : window;

      fromEvent(document, 'scroll').pipe(takeUntil(this.destroyed), debounceTime(100)).subscribe(() => {
        this.onScroll();
      });
    });
  }

  ngOnDestroy(): void {
    this.destroyed.next();
  }

  updateScrollPosition(): void {
    this.links = this.createLinks();
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
    const scrollTop = window && window.pageYOffset || 0;
    const topOffset = this.scrollContainer.clientHeight || 0;
    for (let i = 0; i < this.links.length; i++) {
      this.links[i].active = this.isLinkActive(this.links[i], this.links[i + 1]);
    }
  }

  private isLinkActive(currentLink: any, nextLink: any): boolean {
    const scrollTop = window && window.pageYOffset || 0;
    const topOffset = this.scrollContainer.clientHeight || 0;
    const top = scrollTop + topOffset;
    return top >= currentLink.top && !(nextLink && nextLink.top < top);
  }
}
