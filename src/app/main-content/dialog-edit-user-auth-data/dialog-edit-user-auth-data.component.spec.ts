import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEditUserAuthDataComponent } from './dialog-edit-user-auth-data.component';

describe('DialogEditUserAuthDataComponent', () => {
  let component: DialogEditUserAuthDataComponent;
  let fixture: ComponentFixture<DialogEditUserAuthDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogEditUserAuthDataComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogEditUserAuthDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
