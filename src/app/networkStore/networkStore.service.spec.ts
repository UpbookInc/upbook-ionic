import { TestBed } from '@angular/core/testing';

import { NetworkStoreService } from './networkStore.service';

describe('NetworkStoreService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NetworkStoreService = TestBed.get(NetworkStoreService);
    expect(service).toBeTruthy();
  });
});
