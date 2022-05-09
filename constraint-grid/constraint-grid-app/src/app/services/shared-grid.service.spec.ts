import { TestBed } from '@angular/core/testing';

import { SharedGridService } from './shared-grid.service';

describe('SharedGridService', () => {
  let service: SharedGridService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedGridService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
