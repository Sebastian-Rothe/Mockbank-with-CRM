import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEditUserPasswordComponent } from './dialog-edit-user-password.component';

describe('DialogEditUserPasswordComponent', () => {
  let component: DialogEditUserPasswordComponent;
  let fixture: ComponentFixture<DialogEditUserPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogEditUserPasswordComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogEditUserPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
