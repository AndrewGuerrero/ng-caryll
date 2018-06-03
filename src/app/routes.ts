import { Routes } from '@angular/router';
import { SidenavComponent } from './sidenav/sidenav.component';
import { DocumentViewerComponent } from './document-viewer/document-viewer.component';


export const CARYLL_ROUTES: Routes = [
   { path: '', redirectTo: 'building_evolutionary_architectures', pathMatch: 'full' },
   {
      path: '', component: SidenavComponent,
      children: [
         { path: ':id', component: DocumentViewerComponent, pathMatch: 'full' }
      ]
   }
];