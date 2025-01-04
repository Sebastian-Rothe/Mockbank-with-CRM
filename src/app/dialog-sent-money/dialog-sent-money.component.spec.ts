import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogSentMoneyComponent } from './dialog-sent-money.component';

describe('DialogSentMoneyComponent', () => {
  let component: DialogSentMoneyComponent;
  let fixture: ComponentFixture<DialogSentMoneyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogSentMoneyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogSentMoneyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
