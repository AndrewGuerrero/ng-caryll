import { Component } from '@angular/core';
import { DocumentationItemsService } from '../../shared/documentation-items/documentation-items.service';

@Component({
  selector: 'ngc-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent {
  constructor(public docItems: DocumentationItemsService) { }
}
