import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlldifferentOptionsMenuComponent } from './alldifferent-options-menu.component';

describe('AlldifferentOptionsMenuComponent', () => {
  let component: AlldifferentOptionsMenuComponent;
  let fixture: ComponentFixture<AlldifferentOptionsMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlldifferentOptionsMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AlldifferentOptionsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
