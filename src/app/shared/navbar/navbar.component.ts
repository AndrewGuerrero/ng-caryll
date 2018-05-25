import { Component, Output, EventEmitter, NgZone } from '@angular/core';
import { PageTitleService } from '../page-title/page-title.service';

const SMALL_WIDTH_BREAKPOINT = 720;

@Component({
  selector: 'ngc-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  private mediaMatcher: MediaQueryList = matchMedia(`(max-width: ${SMALL_WIDTH_BREAKPOINT}px`);

  constructor(
    private pageTitle: PageTitleService,
    private zone: NgZone) {
    this.mediaMatcher.addListener(mql => zone.run(() => this.mediaMatcher = mql));
  }

  @Output() toggleSidenav = new EventEmitter<void>();

  get title() {
    return this.pageTitle.title;
  }

  isScreenSmall(): boolean {
    return this.mediaMatcher.matches;
  }
}
