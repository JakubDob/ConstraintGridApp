import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValueOptionsMenuComponent } from './value-options-menu.component';

describe('ValueOptionsMenuComponent', () => {
  let component: ValueOptionsMenuComponent;
  let fixture: ComponentFixture<ValueOptionsMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ValueOptionsMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ValueOptionsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
