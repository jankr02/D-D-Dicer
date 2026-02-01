import { TestBed } from '@angular/core/testing';
import { SwUpdate } from '@angular/service-worker';
import { EMPTY } from 'rxjs';
import { App } from './app';

describe('App', () => {
  const mockSwUpdate = {
    isEnabled: false,
    versionUpdates: EMPTY,
    unrecoverable: EMPTY,
    checkForUpdate: () => Promise.resolve(false),
    activateUpdate: () => Promise.resolve(false),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [{ provide: SwUpdate, useValue: mockSwUpdate }],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
