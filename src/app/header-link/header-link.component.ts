import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'ngc-header-link',
  templateUrl: './header-link.component.html',
})
export class HeaderLinkComponent implements OnInit {
  @Input() input: string;

  url: string;
  private rootUrl: string;

  constructor(router: Router) {
    this.rootUrl = router.url.split('#')[0];
  }

  ngOnInit() {
    this.url = `${this.rootUrl}#${this.input}`;
  }
}
