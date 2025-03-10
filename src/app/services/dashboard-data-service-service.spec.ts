import { TestBed } from '@angular/core/testing';

import { DashboardDataServiceService } from './dashboard-data-service.service';

describe('DashboardDataServiceService', () => {
  let service: DashboardDataServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardDataServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
