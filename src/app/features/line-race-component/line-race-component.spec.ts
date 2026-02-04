import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineRaceComponent } from './line-race-component';

describe('LineRaceComponent', () => {
  let component: LineRaceComponent;
  let fixture: ComponentFixture<LineRaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LineRaceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LineRaceComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
