import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransfersChartComponent } from './transfers-chart.component';

describe('TransfersChartComponent', () => {
  let component: TransfersChartComponent;
  let fixture: ComponentFixture<TransfersChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransfersChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TransfersChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
