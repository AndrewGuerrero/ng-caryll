import { Component, OnInit, Input, Inject, ElementRef, ViewChildren, QueryList, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { asapScheduler as asap, Subject, fromEvent, combineLatest } from 'rxjs';
import { takeUntil, debounceTime, subscribeOn, startWith } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import { TocItem, TableOfContentsService } from '../shared/table-of-contents.service';
import { Element } from '@angular/compiler';

@Component({
  selector: 'ngc-table-of-contents',
  templateUrl: './table-of-contents.component.html',
  styleUrls: ['./table-of-contents.component.scss']
})
export class TableOfContentsComponent implements OnInit, AfterViewInit, OnDestroy {
  activeIndex: number | null = null;

  @ViewChildren('tocItem', { read: ElementRef }) private items: QueryList<ElementRef>;
  tocList: TocItem[];
  private destroyed = new Subject();

  constructor(
    private elementRef: ElementRef,
    private tableOfContentsService: TableOfContentsService) { }

  ngOnInit() {
    this.tableOfContentsService.tocList
      .pipe(takeUntil(this.destroyed))
      .subscribe(tocList => {
        this.tocList = tocList;
      });
  }

  ngAfterViewInit() {
    combineLatest(this.tableOfContentsService.activeItemIndex
      .pipe(subscribeOn(asap)), this.items.changes
        .pipe(startWith(this.items)))
      .pipe(takeUntil(this.destroyed))
      .subscribe(([index, items]) => {
        this.activeIndex = index;
        if (index === null || index >= items.length) {
          return;
        }
        const e = items.toArray()[index].nativeElement;
        const p = e.offsetParent;

        const eRect = e.getBoundingClientRect();
        const pRect = p.getBoundingClientRect();

        const isInViewport = (eRect.top >= pRect.top) && (eRect.bottom <= pRect.bottom);

        if (!isInViewport) {
          p.scrollTop += (eRect.top - pRect.top) - (p.clientHeight / 2);
        }
      });
  }

  ngOnDestroy() {
    this.destroyed.next();
  }
}