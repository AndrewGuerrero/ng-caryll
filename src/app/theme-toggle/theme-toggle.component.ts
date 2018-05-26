import { Component } from '@angular/core';
import { ThemeService } from '../shared/theme.service';

@Component({
  selector: 'ngc-theme-toggle',
  templateUrl: './theme-toggle.component.html',
})
export class ThemeToggleComponent {

  constructor(private theme: ThemeService) { }

  toggleTheme() {
    this.theme.toggleTheme();
  }
}
