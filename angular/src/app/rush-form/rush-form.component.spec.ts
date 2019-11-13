import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RushFormComponent } from './rush-form.component';

describe('RushFormComponent', () => {
  let component: RushFormComponent;
  let fixture: ComponentFixture<RushFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RushFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RushFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
