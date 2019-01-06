import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DocumentationItemsService } from '../shared/documentation-items.service';
import { MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver } from '@angular/cdk/layout';

const MEDIUM_WIDTH_BREAKPOINT = 1150;
const LARGE_WIDTH_BREAKPOINT = 1450;

@Component({
  selector: 'ngc-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SidenavComponent implements OnInit {

  constructor(
    public docItems: DocumentationItemsService,
    private router: Router,
    private breakpointObserver: BreakpointObserver) { }

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
    return this.breakpointObserver.isMatched(`(max-width: ${MEDIUM_WIDTH_BREAKPOINT}px`);
  }

  isScreenLarge(): boolean {
    return this.breakpointObserver.isMatched(`(max-width: ${LARGE_WIDTH_BREAKPOINT}px`);
  }
}
