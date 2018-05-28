import { TestBed, inject } from '@angular/core/testing';

import { ElementLoaderService } from './element-loader.service';

describe('ElementLoaderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ElementLoaderService]
    });
  });

  it('should be created', inject([ElementLoaderService], (service: ElementLoaderService) => {
    expect(service).toBeTruthy();
  }));
});
