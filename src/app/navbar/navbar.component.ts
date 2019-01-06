import { Component, Output, EventEmitter } from '@angular/core';
import { PageTitleService } from '../shared/page-title.service';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { SearchService } from '../shared/search.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { SearchResultsComponent } from '../search-results/search-results.component';
import { BreakpointObserver } from '@angular/cdk/layout';

const SMALL_WIDTH_BREAKPOINT = 750;

@Component({
  selector: 'ngc-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  eyeIconMessage = `
  A secret symbol left by Caryll, runesmith of Byrgenwerth.
  A transcription of "Eye," as spoken by left-behind Great Ones.

  Eyes symbolize the truth Master Willem sought in his research.
  Disillusioned by the limits of human intellect, Master Willem looked
  to beings from higher planes for guidance, and sought to line his brain with eyes in order to elevate his thoughts.
  `;

  moonIconMessage = `
  A secret symbol left by Caryll, runesmith of Byrgenwerth.
  A transcription of "moon", as spoken by the Great Ones inhabiting the nightmare.

  The Great Ones that inhabit the nightmare are sympathetic in spirit, and often answer when called upon.
  `;

  constructor(
    private pageTitle: PageTitleService,
    private searchService: SearchService,
    private bottomSheet: MatBottomSheet,
    private breakpointObserver: BreakpointObserver,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer) {
    this.iconRegistry.addSvgIcon('moon',
      this.sanitizer.bypassSecurityTrustResourceUrl('assets/img/moon.svg'));
    this.iconRegistry.addSvgIcon('eye',
      this.sanitizer.bypassSecurityTrustResourceUrl('assets/img/eye.svg'));
    this.iconRegistry.addSvgIcon('github',
      this.sanitizer.bypassSecurityTrustResourceUrl('assets/img/github.svg'));
  }

  @Output() toggleSidenav = new EventEmitter<void>();
  @Output() toggleSidenavEnd = new EventEmitter<void>();

  get title() {
    return this.pageTitle.title;
  }

  isScreenSmall(): boolean {
    return this.breakpointObserver.isMatched(`(max-width: ${SMALL_WIDTH_BREAKPOINT}px`);
  }

  doSearch(query: string) {
    this.searchService.search(query).subscribe((hits) => {
      if (hits.results.length) {
        this.bottomSheet.open(SearchResultsComponent, { data: hits });
      }
    });
  }
}
