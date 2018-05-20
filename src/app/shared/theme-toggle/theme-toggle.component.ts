import { Component } from '@angular/core';
import { ThemeService } from '../theme/theme.service';

@Component({
  selector: 'ngc-theme-toggle',
  templateUrl: './theme-toggle.component.html',
})
export class ThemeToggleComponent {

  constructor(private theme: ThemeService) { }

  toggleTheme() {
    console.log("toggleTheme");
    this.theme.toggleTheme();
  }
}
