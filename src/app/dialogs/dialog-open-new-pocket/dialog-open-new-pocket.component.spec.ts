import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogOpenNewPocketComponent } from './dialog-open-new-pocket.component';

describe('DialogOpenNewPocketComponent', () => {
  let component: DialogOpenNewPocketComponent;
  let fixture: ComponentFixture<DialogOpenNewPocketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogOpenNewPocketComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogOpenNewPocketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
