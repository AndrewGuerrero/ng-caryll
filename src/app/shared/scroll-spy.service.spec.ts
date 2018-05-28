import { TestBed, inject } from '@angular/core/testing';

import { ScrollSpyService } from './scroll-spy.service';

describe('ScrollSpyService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ScrollSpyService]
    });
  });

  it('should be created', inject([ScrollSpyService], (service: ScrollSpyService) => {
    expect(service).toBeTruthy();
  }));
});
