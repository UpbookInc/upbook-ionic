import { TestBed } from '@angular/core/testing';

import { DeltasService } from './deltas.service';

describe('DeltasService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DeltasService = TestBed.get(DeltasService);
    expect(service).toBeTruthy();
  });
});
