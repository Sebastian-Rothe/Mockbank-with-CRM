import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogMoveMoneyComponent } from './dialog-move-money.component';

describe('DialogMoveMoneyComponent', () => {
  let component: DialogMoveMoneyComponent;
  let fixture: ComponentFixture<DialogMoveMoneyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogMoveMoneyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogMoveMoneyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
