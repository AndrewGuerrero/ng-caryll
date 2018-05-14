import { Routes } from '@angular/router';
import { SidenavComponent } from './pages/sidenav/sidenav.component';
import { DocumentViewerComponent } from './pages/document-viewer/document-viewer.component';


export const CARYLL_ROUTES: Routes = [
  {
    path: '', component: SidenavComponent,
    children: [
      { path: ':id', component: DocumentViewerComponent, pathMatch: 'full' }
    ]
  }
];