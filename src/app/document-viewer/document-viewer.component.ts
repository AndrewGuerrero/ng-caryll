import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { PageTitleService } from '../shared/page-title.service';
import { ThemeService } from '../shared/theme.service';
import { ActivatedRoute } from '@angular/router';
import { DocItem, DocumentationItemsService } from '../shared/documentation-items.service';
import { DocumentService } from '../shared/document.service';
import { ScrollService } from '../shared/scroll.service';

@Component({
  selector: 'ngc-document-viewer',
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DocumentViewerComponent {
  currentDocument: string;

  private currentLocation: string;
  private docItem: DocItem;


  constructor(
    private route: ActivatedRoute,
    private pageTitleService: PageTitleService,
    private themeService: ThemeService,
    private documentService: DocumentService,
    private docItemService: DocumentationItemsService,
    private scrollService: ScrollService,
  ) {
    route.params.subscribe(p => {
      if (p['id'] === this.currentLocation) {
        this.scrollService.scroll();
      }
      this.docItem = docItemService.getItemById(p['id']);
      this.themeService.setTheme(this.docItem.theme);
      this.pageTitleService.title = this.docItem.name;
      this.documentService
        .getDocument(this.docItem.id)
        .subscribe(doc => this.currentDocument = doc);
    });
  }

  onDocRemoved() {
    this.scrollService.scrollToTop();
  }

  onDocInserted() {
    setTimeout(() => this.scrollService.scroll(), 500);
  }
}