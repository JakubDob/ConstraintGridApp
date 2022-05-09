import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountOptionsMenuComponent } from './count-options-menu.component';

describe('CountOptionsMenuComponent', () => {
  let component: CountOptionsMenuComponent;
  let fixture: ComponentFixture<CountOptionsMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CountOptionsMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CountOptionsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
