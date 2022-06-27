import { TestBed } from '@angular/core/testing';

import { AsmService } from './asm.service';

describe('AsmService', () => {
  let service: AsmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AsmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
