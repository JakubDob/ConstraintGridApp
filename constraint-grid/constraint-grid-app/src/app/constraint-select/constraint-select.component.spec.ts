import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstraintSelectComponent } from './constraint-select.component';

describe('ConstraintSelectComponent', () => {
  let component: ConstraintSelectComponent;
  let fixture: ComponentFixture<ConstraintSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConstraintSelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConstraintSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
