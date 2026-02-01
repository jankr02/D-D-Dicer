import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { DiceGroupForm } from './dice-group-form';

describe('DiceGroupForm', () => {
  let component: DiceGroupForm;
  let fixture: ComponentFixture<DiceGroupForm>;
  let fb: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiceGroupForm, ReactiveFormsModule]
    })
    .compileComponents();

    fb = TestBed.inject(FormBuilder);
    fixture = TestBed.createComponent(DiceGroupForm);
    component = fixture.componentInstance;

    // Provide required Input
    component.groupForm = fb.group({
      count: [1],
      sides: [20],
      keepDrop: [null]
    });
    component.groupIndex = 0;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
