import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenNewAccountComponent } from './open-new-account.component';

describe('OpenNewAccountComponent', () => {
  let component: OpenNewAccountComponent;
  let fixture: ComponentFixture<OpenNewAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenNewAccountComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OpenNewAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
