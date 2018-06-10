import { Component, OnInit, ViewEncapsulation, NgZone, ViewChild } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { Router } from '@angular/router';
import { DocumentationItemsService } from '../shared/documentation-items.service';
import { MatSidenav } from '@angular/material/sidenav';

const MEDIUM_WIDTH_BREAKPOINT = 1000;
const LARGE_WIDTH_BREAKPOINT = 1300;

@Component({
  selector: 'ngc-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SidenavComponent implements OnInit {
  private mediaMatcherMedium: MediaQueryList = matchMedia(`(max-width: ${MEDIUM_WIDTH_BREAKPOINT}px`);
  private mediaMatcherLarge: MediaQueryList = matchMedia(`(max-width: ${LARGE_WIDTH_BREAKPOINT}px`);


  constructor(public docItems: DocumentationItemsService,
    private router: Router,
    zone: NgZone) {
    this.mediaMatcherMedium.addListener(mql => zone.run(() => this.mediaMatcherMedium = mql));
    this.mediaMatcherLarge.addListener(mql => zone.run(() => this.mediaMatcherLarge = mql));
  }

  @ViewChild(MatSidenav) sidenav: MatSidenav;
  @ViewChild(MatSidenav) sidenavEnd: MatSidenav;

  ngOnInit() {
    this.router.events.subscribe(() => {
      if (this.isScreenMedium()) {
        this.sidenav.close();
        this.sidenavEnd.close();
      }
    });
  }

  isScreenMedium(): boolean {
    return this.mediaMatcherMedium.matches;
  }

  isScreenLarge(): boolean {
    return this.mediaMatcherLarge.matches;
  }
}
