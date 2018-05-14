import { ComponentPortal, DomPortalHost } from '@angular/cdk/portal';
import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ComponentFactoryResolver, ApplicationRef, Injector, ViewContainerRef, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HeaderLinkComponent } from '../header-link/header-link.component';
import { Router } from '@angular/router';

@Component({
  selector: 'ngc-document',
  template: 'Loading document...',
})
export class DocumentComponent implements OnDestroy {
  private documentFetchSubscription: Subscription;
  private portalHosts: DomPortalHost[] = [];

  @Input() set documentUrl(url: string) {
    this.fetchDocument(url);
  }

  @Output() contentLoaded = new EventEmitter<void>();

  textContent = '';

  constructor(
    private http: HttpClient,
    private elementRef: ElementRef,
    private componentFactorResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector,
    private viewContainerRef: ViewContainerRef,
    private router: Router,
  ) { }

  private fetchDocument(url: string): void {
    if (this.documentFetchSubscription) {
      this.documentFetchSubscription.unsubscribe();
    }

    this.documentFetchSubscription = this.http.get(url, { responseType: 'text' }).subscribe(
      document => this.updateDocument(document),
      error => this.showError(url, error)
    );
  }

  private updateDocument(document: string): void {
    this.elementRef.nativeElement.innerHTML = document;
    this.textContent = this.elementRef.nativeElement.textContent;
    this.loadComponents('header-link', HeaderLinkComponent)
    this.fixFragmentUrls();
    this.contentLoaded.next();
  }

  private showError(url: string, error: HttpErrorResponse) {
    console.log(error);
    this.elementRef.nativeElement.innerText = `Failed to load document: ${url}. Error: ${error.statusText}`;
  }

  private loadComponents(componentName: string, componentClass: any) {
    let elements = this.elementRef.nativeElement.querySelectorAll(`[${componentName}]`);
    Array.prototype.slice.call(elements).forEach((element: Element) => {
      let component = element.getAttribute(componentName);
      let portalHost = new DomPortalHost(element, this.componentFactorResolver, this.appRef, this.injector);
      let componentPortal = new ComponentPortal(componentClass, this.viewContainerRef);
      let componentViewer = portalHost.attach(componentPortal);
      (componentViewer.instance as HeaderLinkComponent).input = component;

      this.portalHosts.push(portalHost);
    });
  }

  private fixFragmentUrls() {
    const baseUrl = this.router.url.split('#')[0];
    const anchorElements = [].slice.call(this.elementRef.nativeElement.querySelectorAll('a')) as HTMLAnchorElement[];

    anchorElements.filter(anchorEl => anchorEl.hash && anchorEl.host === location.host)
      .forEach(anchorEl => anchorEl.href = `${baseUrl}${anchorEl.hash}`);
  }

  private clearLoadedComponents() {
    this.portalHosts.forEach(h => h.dispose());
    this.portalHosts = [];
  }

  ngOnDestroy(): void {
    this.clearLoadedComponents();

    if (this.documentFetchSubscription) {
      this.documentFetchSubscription.unsubscribe();
    }
  }
}