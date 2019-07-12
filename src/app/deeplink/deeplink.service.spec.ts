import { TestBed } from '@angular/core/testing';

import { DeeplinkService } from './deeplink.service';

describe('DeeplinkService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DeeplinkService = TestBed.get(DeeplinkService);
    expect(service).toBeTruthy();
  });
});
