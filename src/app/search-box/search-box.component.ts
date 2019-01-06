import { Component, Output, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SearchService } from '../shared/search.service';

@Component({
  selector: 'ngc-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.scss']
})
export class SearchBoxComponent implements OnInit {

  private searchDebounce = 300;
  private searchSubject = new Subject<string>();
  @Output() onSearch = this.searchSubject.pipe(debounceTime(this.searchDebounce));

  constructor(private searchService: SearchService) { }

  ngOnInit() {
    if ('Worker' in window) {
      this.searchService.initWorker('assets/js/search-worker.js', 2000);
    }
  }

  doSearch(query: string) {
    this.searchSubject.next(query);
    return false;
  }
}
