import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RollHistory } from './roll-history';

describe('RollHistory', () => {
  let component: RollHistory;
  let fixture: ComponentFixture<RollHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RollHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RollHistory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
