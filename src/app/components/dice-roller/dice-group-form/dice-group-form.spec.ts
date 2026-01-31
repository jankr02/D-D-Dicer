import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiceGroupForm } from './dice-group-form';

describe('DiceGroupForm', () => {
  let component: DiceGroupForm;
  let fixture: ComponentFixture<DiceGroupForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiceGroupForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiceGroupForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
