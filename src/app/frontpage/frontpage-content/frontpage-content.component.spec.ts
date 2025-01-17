import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrontpageContentComponent } from './frontpage-content.component';

describe('FrontpageContentComponent', () => {
  let component: FrontpageContentComponent;
  let fixture: ComponentFixture<FrontpageContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FrontpageContentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FrontpageContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
