import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiceRoller } from './dice-roller';

describe('DiceRoller', () => {
  let component: DiceRoller;
  let fixture: ComponentFixture<DiceRoller>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiceRoller]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiceRoller);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
