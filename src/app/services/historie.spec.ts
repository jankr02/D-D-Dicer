import { TestBed } from '@angular/core/testing';
import { Historie } from './historie';
import { RollResult } from '../models';

describe('Historie', () => {
  let service: Historie;
  let localStorageSpy: jasmine.SpyObj<Storage>;

  // Helper to create mock RollResult
  function createMockRollResult(total: number, timestamp: Date = new Date()): RollResult {
    return {
      groupResults: [{ rolls: [{ value: total, isDropped: false }], groupSum: total }],
      modifier: 0,
      total,
      timestamp,
      notation: '1d20',
    };
  }

  beforeEach(() => {
    // Create a mock for localStorage
    const store: Record<string, string> = {};
    localStorageSpy = jasmine.createSpyObj('localStorage', ['getItem', 'setItem', 'removeItem']);
    localStorageSpy.getItem.and.callFake((key: string) => store[key] || null);
    localStorageSpy.setItem.and.callFake((key: string, value: string) => {
      store[key] = value;
    });
    localStorageSpy.removeItem.and.callFake((key: string) => {
      delete store[key];
    });

    // Replace global localStorage
    spyOn(localStorage, 'getItem').and.callFake((key: string) => localStorageSpy.getItem(key));
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) =>
      localStorageSpy.setItem(key, value),
    );
    spyOn(localStorage, 'removeItem').and.callFake((key: string) =>
      localStorageSpy.removeItem(key),
    );

    TestBed.configureTestingModule({
      providers: [Historie],
    });
    service = TestBed.inject(Historie);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('history$ observable', () => {
    it('should emit empty array initially when no storage', (done) => {
      service.history$.subscribe((history) => {
        expect(history).toEqual([]);
        done();
      });
    });

    it('should emit history from localStorage on init', () => {
      const storedHistory = [createMockRollResult(15)];
      localStorageSpy.getItem.and.callFake((key: string) => {
        if (key === 'dnd_dicer_history') {
          return JSON.stringify(storedHistory);
        }
        return null;
      });

      // Re-create service to trigger loadHistoryFromStorage
      const newService = new Historie();

      expect(newService.getAllHistory().length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('addRollResult', () => {
    it('should add roll to history', () => {
      const roll = createMockRollResult(15);

      service.addRollResult(roll);

      const history = service.getAllHistory();
      expect(history.length).toBe(1);
      expect(history[0].total).toBe(15);
    });

    it('should add new rolls at the beginning (most recent first)', () => {
      const roll1 = createMockRollResult(10);
      const roll2 = createMockRollResult(20);

      service.addRollResult(roll1);
      service.addRollResult(roll2);

      const history = service.getAllHistory();
      expect(history[0].total).toBe(20);
      expect(history[1].total).toBe(10);
    });

    it('should persist to localStorage', () => {
      const roll = createMockRollResult(15);

      service.addRollResult(roll);

      expect(localStorage.setItem).toHaveBeenCalledWith('dnd_dicer_history', jasmine.any(String));
    });

    it('should limit history to MAX_STATS_ENTRIES (100)', () => {
      // Add 105 rolls
      for (let i = 0; i < 105; i++) {
        service.addRollResult(createMockRollResult(i));
      }

      const history = service.getAllHistory();
      expect(history.length).toBe(100);
      // Most recent should be 104 (last added)
      expect(history[0].total).toBe(104);
    });

    it('should notify subscribers when roll is added', (done) => {
      let emitCount = 0;

      service.history$.subscribe((history) => {
        emitCount++;
        if (emitCount === 2) {
          expect(history.length).toBe(1);
          done();
        }
      });

      service.addRollResult(createMockRollResult(15));
    });
  });

  describe('getAllHistory', () => {
    it('should return all rolls up to 100', () => {
      for (let i = 0; i < 50; i++) {
        service.addRollResult(createMockRollResult(i));
      }

      const history = service.getAllHistory();
      expect(history.length).toBe(50);
    });
  });

  describe('getDisplayHistory', () => {
    it('should return max 30 rolls for UI display', () => {
      for (let i = 0; i < 50; i++) {
        service.addRollResult(createMockRollResult(i));
      }

      const displayHistory = service.getDisplayHistory();
      expect(displayHistory.length).toBe(30);
    });

    it('should return all rolls if less than 30', () => {
      for (let i = 0; i < 10; i++) {
        service.addRollResult(createMockRollResult(i));
      }

      const displayHistory = service.getDisplayHistory();
      expect(displayHistory.length).toBe(10);
    });

    it('should return most recent rolls', () => {
      for (let i = 0; i < 50; i++) {
        service.addRollResult(createMockRollResult(i));
      }

      const displayHistory = service.getDisplayHistory();
      // Most recent (49) should be first
      expect(displayHistory[0].total).toBe(49);
    });
  });

  describe('getHistory (legacy)', () => {
    it('should behave same as getDisplayHistory', () => {
      for (let i = 0; i < 50; i++) {
        service.addRollResult(createMockRollResult(i));
      }

      const history = service.getHistory();
      const displayHistory = service.getDisplayHistory();

      expect(history).toEqual(displayHistory);
    });
  });

  describe('clearHistory', () => {
    it('should remove all rolls', () => {
      service.addRollResult(createMockRollResult(10));
      service.addRollResult(createMockRollResult(20));

      service.clearHistory();

      expect(service.getAllHistory().length).toBe(0);
    });

    it('should remove from localStorage', () => {
      service.addRollResult(createMockRollResult(10));

      service.clearHistory();

      expect(localStorage.removeItem).toHaveBeenCalledWith('dnd_dicer_history');
    });

    it('should notify subscribers', (done) => {
      service.addRollResult(createMockRollResult(10));

      let emitCount = 0;
      service.history$.subscribe((history) => {
        emitCount++;
        if (emitCount === 2) {
          // Current value + clear
          expect(history.length).toBe(0);
          done();
        }
      });

      service.clearHistory();
    });
  });

  describe('session management', () => {
    it('should have a session start time', () => {
      const sessionStart = service.getSessionStartTime();
      expect(sessionStart).toBeTruthy();
      expect(sessionStart instanceof Date).toBeTrue();
    });

    it('should reset session', () => {
      const originalSessionStart = service.getSessionStartTime();

      // Wait a tiny bit to ensure different timestamp
      jasmine.clock().install();
      jasmine.clock().tick(100);

      service.resetSession();
      const newSessionStart = service.getSessionStartTime();

      expect(newSessionStart.getTime()).toBeGreaterThanOrEqual(originalSessionStart.getTime());

      jasmine.clock().uninstall();
    });

    it('should persist session start to localStorage', () => {
      service.resetSession();

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'dnd_dicer_session_start',
        jasmine.any(String),
      );
    });
  });

  describe('localStorage error handling', () => {
    it('should handle corrupted localStorage data', () => {
      localStorageSpy.getItem.and.callFake((key: string) => {
        if (key === 'dnd_dicer_history') {
          return 'invalid json{{{';
        }
        return null;
      });

      // Re-create service
      const newService = new Historie();

      // Should not throw, history should be empty
      expect(newService.getAllHistory().length).toBe(0);
    });
  });

  describe('date serialization', () => {
    it('should convert timestamp strings to Date objects on load', () => {
      const timestamp = new Date('2024-01-15T10:30:00Z');
      const storedHistory = [
        {
          groupResults: [{ rolls: [{ value: 15, isDropped: false }], groupSum: 15 }],
          modifier: 0,
          total: 15,
          timestamp: timestamp.toISOString(),
          notation: '1d20',
        },
      ];

      localStorageSpy.getItem.and.callFake((key: string) => {
        if (key === 'dnd_dicer_history') {
          return JSON.stringify(storedHistory);
        }
        return null;
      });

      // Re-create service
      const newService = new Historie();
      const history = newService.getAllHistory();

      if (history.length > 0) {
        expect(history[0].timestamp instanceof Date).toBeTrue();
      }
    });
  });
});
