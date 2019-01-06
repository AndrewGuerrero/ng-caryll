import { Component, ViewEncapsulation } from '@angular/core';
import { PageTitleService } from '../shared/page-title.service';
import { ThemeService } from '../shared/theme.service';
import { ActivatedRoute, Router } from '@angular/router';
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

  private docItem: DocItem;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pageTitleService: PageTitleService,
    private themeService: ThemeService,
    private documentService: DocumentService,
    private docItemService: DocumentationItemsService,
    private scrollService: ScrollService,
  ) {
    this.route.fragment.subscribe(() => {
      this.scrollService.scroll();
    });

    this.route.params.subscribe(p => {
      this.scrollService.scroll();
      this.docItem = this.docItemService.getItemById(p['id']);
      if (this.docItem == null) {
        this.router.navigate(['']);
        return;
      }
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
    this.themeService.setTheme(this.docItem.theme);
    setTimeout(() => this.scrollService.scroll(), 500);
  }
}