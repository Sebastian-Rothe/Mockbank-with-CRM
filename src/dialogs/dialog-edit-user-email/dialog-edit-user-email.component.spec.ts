import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEditUserEmailComponent } from './dialog-edit-user-email.component';

describe('DialogEditUserEmailComponent', () => {
  let component: DialogEditUserEmailComponent;
  let fixture: ComponentFixture<DialogEditUserEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogEditUserEmailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogEditUserEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
