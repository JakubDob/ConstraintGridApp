import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolutionOptionsComponent } from './solution-options.component';

describe('SolutionOptionsComponent', () => {
  let component: SolutionOptionsComponent;
  let fixture: ComponentFixture<SolutionOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SolutionOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SolutionOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
