import { TestBed } from '@angular/core/testing';

import { SharedDataEventService } from './shared-data-event.service';

describe('SharedDataEventService', () => {
  let service: SharedDataEventService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedDataEventService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
