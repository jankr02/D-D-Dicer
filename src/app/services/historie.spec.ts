import { TestBed } from '@angular/core/testing';

import { Historie } from './historie';

describe('Historie', () => {
  let service: Historie;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Historie);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
