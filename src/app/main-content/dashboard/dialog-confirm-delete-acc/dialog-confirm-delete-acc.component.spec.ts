import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogConfirmDeleteAccComponent } from './dialog-confirm-delete-acc.component';

describe('DialogConfirmDeleteAccComponent', () => {
  let component: DialogConfirmDeleteAccComponent;
  let fixture: ComponentFixture<DialogConfirmDeleteAccComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogConfirmDeleteAccComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogConfirmDeleteAccComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
