import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { NgCaryllApp } from './ng-caryll-app';
import { SidenavComponent } from './pages/sidenav/sidenav.component';
import { NavComponent } from './pages/nav/nav.component';
import { PageHeaderComponent } from './pages/page-header/page-header.component';
import { DocumentViewerComponent } from './pages/document-viewer/document-viewer.component';

import { DocumentationItemsService } from './shared/documentation-items/documentation-items.service';
import { PageTitleService } from './pages/page-title/page-title.service';

import { CARYLL_ROUTES } from './routes';
import { DocumentComponent } from './shared/document/document.component';
import { TableOfContentsComponent } from './shared/table-of-contents/table-of-contents.component';
import { HeaderLinkComponent } from './shared/header-link/header-link.component';
import { NavigationFocusDirective } from './shared/navigation-focus/navigation-focus.directive';

@NgModule({
  declarations: [
    NgCaryllApp,
    SidenavComponent,
    NavComponent,
    PageHeaderComponent,
    DocumentViewerComponent,
    DocumentComponent,
    TableOfContentsComponent,
    HeaderLinkComponent,
    NavigationFocusDirective
  ],
  imports: [
    BrowserModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    RouterModule.forRoot(CARYLL_ROUTES),
    HttpClientModule
  ],
  providers: [
    DocumentationItemsService,
    PageTitleService,
  ],
  entryComponents: [
    HeaderLinkComponent,
    TableOfContentsComponent,
  ],
  bootstrap: [NgCaryllApp]
})
export class AppModule { }
