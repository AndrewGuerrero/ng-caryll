import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { DocItem, DocumentationItemsService } from '../../shared/documentation-items/documentation-items.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { PageTitleService } from '../../shared/page-title/page-title.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { mapChildrenIntoArray } from '@angular/router/src/url_tree';
import { TableOfContentsComponent } from '../../shared/table-of-contents/table-of-contents.component';
import { ThemeService } from '../../shared/theme/theme.service';

@Component({
  selector: 'ngc-document-viewer',
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DocumentViewerComponent {
  @ViewChild('toc') tableOfContents: TableOfContentsComponent;

  docItem: DocItem;

  constructor(
    private route: ActivatedRoute,
    private pageTitle: PageTitleService,
    private breakpointObserver: BreakpointObserver,
    public docItems: DocumentationItemsService,
    private theme: ThemeService,
  ) {
    route.params.subscribe(p => {
      this.docItem = docItems.getItemById(p['id']);
      this.pageTitle.title = this.docItem.name;
    });
  }

  onContentLoaded(): void {
    this.theme.setTheme(this.docItem.theme);
    if (this.tableOfContents) {
      this.tableOfContents.updateScrollPosition();
    }
  }
}