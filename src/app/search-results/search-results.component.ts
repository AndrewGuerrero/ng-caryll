import { Component, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { SearchResults } from '../shared/search.service';

@Component({
  selector: 'ngc-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent {

  constructor(private bottomSheet: MatBottomSheetRef<SearchResultsComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public hits: SearchResults) { }

  openLink(event: MouseEvent): void {
    this.bottomSheet.dismiss();
    event.preventDefault();
  }
}
