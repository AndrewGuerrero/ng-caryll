import { Component, Output, EventEmitter } from '@angular/core';
import { PageTitleService } from '../page-title/page-title.service';

@Component({
  selector: 'ngc-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss'],
})
export class PageHeaderComponent {

  constructor(public pageTitle: PageTitleService) { }

  @Output() toggleSidenav = new EventEmitter<void>();

  getTitle() {
    return this.pageTitle.title;
  }
}
