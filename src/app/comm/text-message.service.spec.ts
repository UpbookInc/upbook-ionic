import { TestBed } from '@angular/core/testing';

import { TextMessageService } from './text-message.service';

describe('TextMessageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TextMessageService = TestBed.get(TextMessageService);
    expect(service).toBeTruthy();
  });
});
