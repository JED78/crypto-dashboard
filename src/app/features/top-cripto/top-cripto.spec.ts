import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopCripto } from './top-cripto';

describe('TopCripto', () => {
  let component: TopCripto;
  let fixture: ComponentFixture<TopCripto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopCripto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopCripto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
