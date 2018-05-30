import { Component, ViewChild, ElementRef, Output, OnInit, EventEmitter } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SearchService, SearchResult } from '../shared/search.service';
import { MatMenuTrigger, MatMenu } from '@angular/material/menu';

@Component({
  selector: 'ngc-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.scss']
})
export class SearchBoxComponent implements OnInit {

  private searchDebounce = 300;
  private searchSubject = new Subject<string>();
  @Output() onSearch = this.searchSubject.pipe(debounceTime(this.searchDebounce));

  constructor(private searchSevice: SearchService) { }

  ngOnInit() {
    if ('Worker' in window) {
      this.searchSevice.initWorker('app/shared/search-worker.js', 2000);
    }
  }

  doSearch(query: string) {
    this.searchSubject.next(query);
    return false;
  }
}
