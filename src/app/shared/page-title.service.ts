import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable()
export class PageTitleService {
  _title = 'Caryll';

  get title(): string { return this._title; }

  set title(title: string) {
    this._title = title;
    if (title !== '') {
      title = `${title} | `;
    } else {
      this._title = 'Caryll';
    }
    this.bodyTitle.setTitle(`${title}Caryll`);
  }

  constructor(private bodyTitle: Title) { }
}
