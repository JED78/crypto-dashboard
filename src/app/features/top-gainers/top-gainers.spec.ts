import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopGainers } from './top-gainers';

describe('TopGainers', () => {
  let component: TopGainers;
  let fixture: ComponentFixture<TopGainers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopGainers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopGainers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
