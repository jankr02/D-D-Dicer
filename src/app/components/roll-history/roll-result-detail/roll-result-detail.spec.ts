import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RollResultDetail } from './roll-result-detail';

describe('RollResultDetail', () => {
  let component: RollResultDetail;
  let fixture: ComponentFixture<RollResultDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RollResultDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RollResultDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
