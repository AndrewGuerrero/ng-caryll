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
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet'

import { NgCaryllApp } from './ng-caryll-app';
import { SidenavComponent } from './sidenav/sidenav.component';
import { NavComponent } from './nav/nav.component';
import { DocumentViewerComponent } from './document-viewer/document-viewer.component';
import { DocumentComponent } from './document/document.component'
import { TableOfContentsComponent } from './table-of-contents/table-of-contents.component';
import { HeaderLinkComponent } from './header-link/header-link.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ThemeToggleComponent } from './theme-toggle/theme-toggle.component';

import { DocumentationItemsService } from './shared/documentation-items.service';
import { PageTitleService } from './shared/page-title.service';
import { TableOfContentsService } from './shared/table-of-contents.service';
import { ThemeService } from './shared/theme.service';
import { ScrollSpyService } from './shared/scroll-spy.service';
import { ScrollService } from './shared/scroll.service';
import { DocumentService } from './shared/document.service';
import { ElementLoaderService } from './shared/element-loader.service';
import { SearchService } from './shared/search.service';

import { CARYLL_ROUTES } from './routes';
import { SearchBoxComponent } from './search-box/search-box.component';
import { SearchResultsComponent } from './search-results/search-results.component';

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
    ThemeToggleComponent,
    SearchBoxComponent,
    SearchResultsComponent
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
    MatDividerModule,
    MatInputModule,
    MatBottomSheetModule,
    RouterModule.forRoot(CARYLL_ROUTES),
    HttpClientModule
  ],
  providers: [
    DocumentationItemsService,
    PageTitleService,
    TableOfContentsService,
    ThemeService,
    ScrollSpyService,
    ScrollService,
    DocumentService,
    ElementLoaderService,
    SearchService,
  ],
  entryComponents: [
    HeaderLinkComponent,
    TableOfContentsComponent,
    SearchBoxComponent,
    SearchResultsComponent,
  ],
  bootstrap: [NgCaryllApp]
})
export class AppModule { }
