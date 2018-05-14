import { TestBed, inject } from '@angular/core/testing';

import { DocumentationItemsService } from './documentation-items.service';

describe('DocumentationItemsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DocumentationItemsService]
    });
  });

  it('should be created', inject([DocumentationItemsService], (service: DocumentationItemsService) => {
    expect(service).toBeTruthy();
  }));
});
