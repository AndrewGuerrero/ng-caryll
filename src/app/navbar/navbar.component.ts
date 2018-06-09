import { Component, Output, EventEmitter, NgZone } from '@angular/core';
import { PageTitleService } from '../shared/page-title.service';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { SearchService } from '../shared/search.service';
import { query } from '@angular/animations';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { SearchResultsComponent } from '../search-results/search-results.component';

const SMALL_WIDTH_BREAKPOINT = 720;

@Component({
  selector: 'ngc-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  private mediaMatcher: MediaQueryList = matchMedia(`(max-width: ${SMALL_WIDTH_BREAKPOINT}px`);

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
    private zone: NgZone,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer) {
    this.mediaMatcher.addListener(mql => zone.run(() => this.mediaMatcher = mql));
    iconRegistry.addSvgIcon('moon',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/moon.svg'));
    iconRegistry.addSvgIcon('eye',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/eye.svg'));

  }

  @Output() toggleSidenav = new EventEmitter<void>();
  @Output() toggleSidenavEnd = new EventEmitter<void>();

  get title() {
    return this.pageTitle.title;
  }

  isScreenSmall(): boolean {
    return this.mediaMatcher.matches;
  }

  doSearch(query: string) {
    this.searchService.search(query).subscribe((hits) => {
      if (hits.results.length) {
        this.bottomSheet.open(SearchResultsComponent, { data: hits });
      }
    });
  }
}
