import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { NgCaryllApp } from './ng-caryll-app';
import { SidenavComponent } from './sidenav/sidenav.component';
import { NavComponent } from './nav/nav.component';
import { DocumentViewerComponent } from './document-viewer/document-viewer.component';

import { DocumentationItemsService } from './shared/documentation-items.service';
import { PageTitleService } from './shared/page-title.service';

import { CARYLL_ROUTES } from './routes';
import { DocumentComponent } from './document/document.component';
import { TableOfContentsComponent } from './table-of-contents/table-of-contents.component';
import { HeaderLinkComponent } from './header-link/header-link.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ThemeToggleComponent } from './theme-toggle/theme-toggle.component';

@NgModule({
  declarations: [
    NgCaryllApp,
    SidenavComponent,
    NavComponent,
    DocumentViewerComponent,
    DocumentComponent,
    TableOfContentsComponent,
    HeaderLinkComponent,
    NavbarComponent,
    ThemeToggleComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatTooltipModule,
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
