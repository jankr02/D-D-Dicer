import { TestBed } from '@angular/core/testing';

import { DiceRoller } from './dice-roller';

describe('DiceRoller', () => {
  let service: DiceRoller;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiceRoller);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
