import { ComponentPortal, DomPortalHost } from '@angular/cdk/portal';
import { Injectable, ComponentFactoryResolver, ApplicationRef, Injector, ViewContainerRef } from '@angular/core';
import { HeaderLinkComponent } from '../header-link/header-link.component';
import { from, Observable } from 'rxjs';

@Injectable()
export class ElementLoaderService {
  private portalHosts: DomPortalHost[] = [];

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector,
  ) { }

  loadHeaderLinks(container: HTMLElement, viewContainerRef: ViewContainerRef) {
    this.clearHeaderLinks();
    const elements = Array.from(container.querySelectorAll('[header-link]'));
    elements.forEach(element => {
      let component = element.getAttribute('header-link');
      let portalHost = new DomPortalHost(element, this.componentFactoryResolver, this.appRef, this.injector);
      let componentPortal = new ComponentPortal(HeaderLinkComponent, viewContainerRef);
      let componentViewer = portalHost.attach(componentPortal);
      (componentViewer.instance as HeaderLinkComponent).input = component;
      this.portalHosts.push(portalHost);
    });
  }

  clearHeaderLinks() {
    this.portalHosts.forEach(h => h.dispose());
    this.portalHosts = [];
  }
}
