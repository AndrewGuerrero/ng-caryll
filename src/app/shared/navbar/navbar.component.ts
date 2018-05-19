import { Component, Output, EventEmitter } from '@angular/core';
import { PageTitleService } from '../page-title/page-title.service';

@Component({
  selector: 'ngc-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  constructor(private pageTitle: PageTitleService) { }

  @Output() toggleSidenav = new EventEmitter<void>();

  get title() {
    return this.pageTitle.title;
  }
}
