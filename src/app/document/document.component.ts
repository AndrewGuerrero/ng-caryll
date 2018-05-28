import { Component, OnDestroy, EventEmitter, Input, Output, ElementRef, ViewContainerRef } from "@angular/core";
import { of, Observable, timer } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { DocItem, DocumentationItemsService } from "../shared/documentation-items.service";
import { ElementLoaderService } from "../shared/element-loader.service";
import { TableOfContentsService } from "../shared/table-of-contents.service";
import { switchMap, takeUntil, tap, catchError } from "rxjs/operators";

const initialDocViewerElement = document.querySelector('ngc-document-viewer');
const initialDocViewerContent = initialDocViewerElement ? initialDocViewerElement.innerHTML : '';

@Component({
  selector: 'ngc-document',
  template: '',
})
export class DocumentComponent implements OnDestroy {

  private docItem: DocItem;
  private hostElement: HTMLElement;
  private void = of<void>(undefined);
  private destroyed = new EventEmitter<void>();
  private docContents = new EventEmitter<string>();

  private currViewContainer: HTMLElement = document.createElement('div');
  private nextViewContainer: HTMLElement = document.createElement('div');

  @Input() set doc(newDoc: string) {
    if (newDoc) {
      this.docContents.emit(newDoc);
    }
  }

  @Output() docReady = new EventEmitter<void>();
  @Output() docRemoved = new EventEmitter<void>();
  @Output() docInserted = new EventEmitter<void>();
  @Output() docRendered = new EventEmitter<void>();

  constructor(
    elementRef: ElementRef,
    private route: ActivatedRoute,
    private viewContainerRef: ViewContainerRef,
    private docItemService: DocumentationItemsService,
    private elementLoaderService: ElementLoaderService,
    private tableOfContentsService: TableOfContentsService,
  ) {
    route.params.subscribe(p => {
      this.docItem = docItemService.getItemById(p['id']);
    });

    this.hostElement = elementRef.nativeElement;
    this.hostElement.innerHTML = initialDocViewerContent;

    if (this.hostElement.firstElementChild) {
      this.currViewContainer = this.hostElement.firstElementChild as HTMLElement;
    }

    this.docContents
      .pipe(switchMap(newDoc => this.render(newDoc)),
        takeUntil(this.destroyed))
      .subscribe();
  }

  ngOnDestroy() {
    this.elementLoaderService.clearHeaderLinks();
    this.destroyed.emit();
  }

  private render(doc: string): Observable<void> {
    let generateTableOfContents: () => void;
    return this.void.pipe(
      tap(() => this.nextViewContainer.innerHTML = doc || ''),
      tap(() => generateTableOfContents = this.generateTableOfContents(this.nextViewContainer)),
      tap(() => this.elementLoaderService.loadHeaderLinks(this.nextViewContainer, this.viewContainerRef)),
      tap(() => this.docReady.emit()),
      switchMap(() => this.swapViews(generateTableOfContents)),
      tap(() => this.docRendered.emit()),
      catchError(err => {
        console.log(err);
        this.nextViewContainer.innerHTML = '';
        return this.void;
      }),
    );
  }

  private generateTableOfContents(targetElem: HTMLElement): () => void {
    return () => {
      this.tableOfContentsService.reset();
      this.tableOfContentsService.genToc(targetElem, this.docItem.id);
    }
  }

  private swapViews(onInsertedCd = () => { }): Observable<void> {
    const raf = new Observable<void>(subscriber => {
      const rafId = requestAnimationFrame(() => {
        subscriber.next();
        subscriber.complete();
      });
      return () => cancelAnimationFrame(rafId);
    });
    let done = this.void;

    if (this.currViewContainer.parentElement) {
      done = done.pipe(
        switchMap(() => this.animateLeave(this.currViewContainer, raf)),
        tap(() => this.currViewContainer.parentElement!.removeChild(this.currViewContainer)),
        tap(() => this.docRemoved.emit()),
      );
    }

    return done.pipe(
      tap(() => this.hostElement.appendChild(this.nextViewContainer)),
      tap(() => onInsertedCd()),
      tap(() => this.docInserted.emit()),
      switchMap(() => this.animateEnter(this.currViewContainer, raf)),
      tap(() => {
        const prevViewContainer = this.currViewContainer;
        this.currViewContainer = this.nextViewContainer;
        this.nextViewContainer = prevViewContainer;
        this.nextViewContainer.innerHTML = '';
      }),
    );
  }

  private getActualDruation(elem: HTMLElement) {
    const cssValue = getComputedStyle(elem).transitionDuration || '';
    const milliseconds = Number(cssValue.replace(/s$/, ''));
    return 1000 * milliseconds;
  };

  private animateLeave(elem: HTMLElement, raf: Observable<void>): Observable<void> {
    return this.animateProp(elem, 'opacity', '1', '0.1', raf);
  }

  private animateEnter(elem: HTMLElement, raf: Observable<void>): Observable<void> {
    return this.animateProp(elem, 'opacity', '0.1', '1', raf);
  }

  private animateProp(elem: HTMLElement, prop: keyof CSSStyleDeclaration, from: string, to: string, raf: Observable<void>, duration = 200): Observable<void> {
    if (prop === 'length' || prop === 'parentRule') {
      return this.void;
    }
    elem.style.transition = '';

    return this.void.pipe(
      switchMap(() => raf), tap(() => elem.style[prop] = from),
      switchMap(() => raf), tap(() => elem.style.transition = `all ${duration}ms ease-in-out`),
      switchMap(() => raf), tap(() => (elem.style as any)[prop] = to),
      switchMap(() => timer(this.getActualDruation(elem))),
      switchMap(() => this.void),
    );
  }
}