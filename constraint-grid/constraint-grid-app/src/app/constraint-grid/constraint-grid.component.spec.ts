import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstraintGridComponent } from './constraint-grid.component';

describe('ConstraintGridComponent', () => {
  let component: ConstraintGridComponent;
  let fixture: ComponentFixture<ConstraintGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConstraintGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConstraintGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
