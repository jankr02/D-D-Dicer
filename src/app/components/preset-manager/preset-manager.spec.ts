import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresetManager } from './preset-manager';

describe('PresetManager', () => {
  let component: PresetManager;
  let fixture: ComponentFixture<PresetManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PresetManager]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PresetManager);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
