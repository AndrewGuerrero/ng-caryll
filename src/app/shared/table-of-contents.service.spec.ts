import { TestBed, inject } from '@angular/core/testing';

import { TableOfContentsService } from './table-of-contents.service';

describe('TableOfContentsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TableOfContentsService]
    });
  });

  it('should be created', inject([TableOfContentsService], (service: TableOfContentsService) => {
    expect(service).toBeTruthy();
  }));
});
