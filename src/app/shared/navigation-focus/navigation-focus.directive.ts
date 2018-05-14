import { Directive, OnInit, ElementRef } from '@angular/core';

let lastTimeoutId = -1;

@Directive({
  selector: '[ngcNavigationFocus]',
  host: { 'tabindex': '-1' },
})
export class NavigationFocusDirective implements OnInit {

  constructor(private element: ElementRef) { }

  ngOnInit() {
    clearTimeout(lastTimeoutId);
    lastTimeoutId = setTimeout(() => this.element.nativeElement.focus(), 100);
  }
}