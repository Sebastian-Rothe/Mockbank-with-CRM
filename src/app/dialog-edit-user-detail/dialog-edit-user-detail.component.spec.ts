import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEditUserDetailComponent } from './dialog-edit-user-detail.component';

describe('DialogEditUserDetailComponent', () => {
  let component: DialogEditUserDetailComponent;
  let fixture: ComponentFixture<DialogEditUserDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogEditUserDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogEditUserDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
