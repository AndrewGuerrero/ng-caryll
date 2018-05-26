import { Routes } from '@angular/router';
import { SidenavComponent } from './sidenav/sidenav.component';
import { DocumentViewerComponent } from './document-viewer/document-viewer.component';


export const CARYLL_ROUTES: Routes = [
  {
    path: '', component: SidenavComponent,
    children: [
      { path: ':id', component: DocumentViewerComponent, pathMatch: 'full' }
    ]
  }
];