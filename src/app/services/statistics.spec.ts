import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { Statistics } from './statistics';
import { Historie } from './historie';
import { RollResult } from '../models';

describe('Statistics', () => {
  let service: Statistics;
  let historieServiceSpy: jasmine.SpyObj<Historie>;
  let historySubject: BehaviorSubject<RollResult[]>;

  // Helper to create mock RollResult
  function createMockRollResult(
    total: number,
    notation: string = '1d20',
    timestamp: Date = new Date(),
    rolls: { value: number; isDropped: boolean }[] = [{ value: total, isDropped: false }],
  ): RollResult {
    return {
      groupResults: [
        { rolls, groupSum: rolls.filter((r) => !r.isDropped).reduce((sum, r) => sum + r.value, 0) },
      ],
      modifier: 0,
      total,
      timestamp,
      notation,
    };
  }

  beforeEach(() => {
    historySubject = new BehaviorSubject<RollResult[]>([]);

    historieServiceSpy = jasmine.createSpyObj(
      'Historie',
      ['getAllHistory', 'getSessionStartTime'],
      {
        history$: historySubject.asObservable(),
      },
    );
    historieServiceSpy.getAllHistory.and.returnValue([]);
    historieServiceSpy.getSessionStartTime.and.returnValue(new Date());

    TestBed.configureTestingModule({
      providers: [Statistics, { provide: Historie, useValue: historieServiceSpy }],
    });
    service = TestBed.inject(Statistics);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('stats$ observable', () => {
    it('should emit null when no history exists', (done) => {
      service.stats$.subscribe((stats) => {
        expect(stats).toBeNull();
        done();
      });
    });

    it('should emit statistics when history exists', (done) => {
      const mockRolls = [
        createMockRollResult(15),
        createMockRollResult(10),
        createMockRollResult(20),
      ];

      historieServiceSpy.getAllHistory.and.returnValue(mockRolls);
      historySubject.next(mockRolls);

      service.stats$.subscribe((stats) => {
        if (stats) {
          expect(stats.basic).toBeTruthy();
          expect(stats.critical).toBeTruthy();
          expect(stats.distribution).toBeTruthy();
          expect(stats.diceTypes).toBeTruthy();
          done();
        }
      });
    });
  });

  describe('calculateBasicMetrics', () => {
    it('should calculate correct total rolls', (done) => {
      const mockRolls = [
        createMockRollResult(10),
        createMockRollResult(15),
        createMockRollResult(20),
      ];

      historieServiceSpy.getAllHistory.and.returnValue(mockRolls);
      historySubject.next(mockRolls);

      service.stats$.subscribe((stats) => {
        if (stats) {
          expect(stats.basic.totalRolls).toBe(3);
          done();
        }
      });
    });

    it('should calculate correct average result', (done) => {
      const mockRolls = [
        createMockRollResult(10),
        createMockRollResult(20),
        createMockRollResult(30),
      ];

      historieServiceSpy.getAllHistory.and.returnValue(mockRolls);
      historySubject.next(mockRolls);

      service.stats$.subscribe((stats) => {
        if (stats) {
          expect(stats.basic.averageResult).toBe(20); // (10+20+30)/3 = 20
          done();
        }
      });
    });

    it('should calculate correct min and max', (done) => {
      const mockRolls = [
        createMockRollResult(5),
        createMockRollResult(15),
        createMockRollResult(25),
      ];

      historieServiceSpy.getAllHistory.and.returnValue(mockRolls);
      historySubject.next(mockRolls);

      service.stats$.subscribe((stats) => {
        if (stats) {
          expect(stats.basic.minResult).toBe(5);
          expect(stats.basic.maxResult).toBe(25);
          done();
        }
      });
    });

    it('should calculate correct total sum', (done) => {
      const mockRolls = [
        createMockRollResult(10),
        createMockRollResult(20),
        createMockRollResult(30),
      ];

      historieServiceSpy.getAllHistory.and.returnValue(mockRolls);
      historySubject.next(mockRolls);

      service.stats$.subscribe((stats) => {
        if (stats) {
          expect(stats.basic.totalSum).toBe(60);
          done();
        }
      });
    });
  });

  describe('calculateCriticalStats', () => {
    it('should count natural 20s', (done) => {
      const mockRolls = [
        createMockRollResult(20, '1d20', new Date(), [{ value: 20, isDropped: false }]),
        createMockRollResult(15, '1d20', new Date(), [{ value: 15, isDropped: false }]),
        createMockRollResult(20, '1d20', new Date(), [{ value: 20, isDropped: false }]),
      ];

      historieServiceSpy.getAllHistory.and.returnValue(mockRolls);
      historySubject.next(mockRolls);

      service.stats$.subscribe((stats) => {
        if (stats) {
          expect(stats.critical.nat20Count).toBe(2);
          expect(stats.critical.totalD20Rolls).toBe(3);
          done();
        }
      });
    });

    it('should count natural 1s', (done) => {
      const mockRolls = [
        createMockRollResult(1, '1d20', new Date(), [{ value: 1, isDropped: false }]),
        createMockRollResult(15, '1d20', new Date(), [{ value: 15, isDropped: false }]),
        createMockRollResult(1, '1d20', new Date(), [{ value: 1, isDropped: false }]),
      ];

      historieServiceSpy.getAllHistory.and.returnValue(mockRolls);
      historySubject.next(mockRolls);

      service.stats$.subscribe((stats) => {
        if (stats) {
          expect(stats.critical.nat1Count).toBe(2);
          done();
        }
      });
    });

    it('should calculate correct percentages', (done) => {
      const mockRolls = [
        createMockRollResult(20, '1d20', new Date(), [{ value: 20, isDropped: false }]),
        createMockRollResult(1, '1d20', new Date(), [{ value: 1, isDropped: false }]),
        createMockRollResult(10, '1d20', new Date(), [{ value: 10, isDropped: false }]),
        createMockRollResult(15, '1d20', new Date(), [{ value: 15, isDropped: false }]),
      ];

      historieServiceSpy.getAllHistory.and.returnValue(mockRolls);
      historySubject.next(mockRolls);

      service.stats$.subscribe((stats) => {
        if (stats) {
          expect(stats.critical.nat20Percentage).toBe(25); // 1/4 = 25%
          expect(stats.critical.nat1Percentage).toBe(25); // 1/4 = 25%
          done();
        }
      });
    });

    it('should return zero stats when no d20 rolls', (done) => {
      const mockRolls = [
        createMockRollResult(6, '2d6', new Date(), [
          { value: 3, isDropped: false },
          { value: 3, isDropped: false },
        ]),
      ];

      historieServiceSpy.getAllHistory.and.returnValue(mockRolls);
      historySubject.next(mockRolls);

      service.stats$.subscribe((stats) => {
        if (stats) {
          expect(stats.critical.totalD20Rolls).toBe(0);
          expect(stats.critical.nat20Count).toBe(0);
          expect(stats.critical.nat1Count).toBe(0);
          done();
        }
      });
    });
  });

  describe('calculateDistribution', () => {
    it('should count occurrences of each value', (done) => {
      const mockRolls = [
        createMockRollResult(10),
        createMockRollResult(10),
        createMockRollResult(15),
        createMockRollResult(20),
      ];

      historieServiceSpy.getAllHistory.and.returnValue(mockRolls);
      historySubject.next(mockRolls);

      service.stats$.subscribe((stats) => {
        if (stats) {
          const dist10 = stats.distribution.find((d) => d.value === 10);
          const dist15 = stats.distribution.find((d) => d.value === 15);
          const dist20 = stats.distribution.find((d) => d.value === 20);

          expect(dist10?.count).toBe(2);
          expect(dist15?.count).toBe(1);
          expect(dist20?.count).toBe(1);
          done();
        }
      });
    });

    it('should sort distribution by value', (done) => {
      const mockRolls = [
        createMockRollResult(20),
        createMockRollResult(5),
        createMockRollResult(15),
      ];

      historieServiceSpy.getAllHistory.and.returnValue(mockRolls);
      historySubject.next(mockRolls);

      service.stats$.subscribe((stats) => {
        if (stats && stats.distribution.length > 0) {
          expect(stats.distribution[0].value).toBe(5);
          expect(stats.distribution[1].value).toBe(15);
          expect(stats.distribution[2].value).toBe(20);
          done();
        }
      });
    });
  });

  describe('calculateDiceTypeAnalysis', () => {
    it('should count dice type usage', (done) => {
      const mockRolls = [
        createMockRollResult(10, '1d20'),
        createMockRollResult(8, '1d20'),
        createMockRollResult(6, '2d6'),
      ];

      historieServiceSpy.getAllHistory.and.returnValue(mockRolls);
      historySubject.next(mockRolls);

      service.stats$.subscribe((stats) => {
        if (stats) {
          const d20Stats = stats.diceTypes.find((dt) => dt.diceType === 'd20');
          const d6Stats = stats.diceTypes.find((dt) => dt.diceType === 'd6');

          expect(d20Stats?.count).toBe(2);
          expect(d6Stats?.count).toBe(1);
          done();
        }
      });
    });

    it('should sort by usage (most used first)', (done) => {
      const mockRolls = [
        createMockRollResult(10, '1d20'),
        createMockRollResult(8, '1d20'),
        createMockRollResult(8, '1d20'),
        createMockRollResult(6, '2d6'),
      ];

      historieServiceSpy.getAllHistory.and.returnValue(mockRolls);
      historySubject.next(mockRolls);

      service.stats$.subscribe((stats) => {
        if (stats && stats.diceTypes.length > 0) {
          expect(stats.diceTypes[0].diceType).toBe('d20');
          done();
        }
      });
    });
  });

  describe('setTimeFilter', () => {
    it('should update time filter and recalculate', (done) => {
      const mockRolls = [createMockRollResult(15)];
      historieServiceSpy.getAllHistory.and.returnValue(mockRolls);
      historySubject.next(mockRolls);

      service.setTimeFilter('today');

      service.stats$.subscribe((stats) => {
        if (stats) {
          expect(stats.timeFilter).toBe('today');
          done();
        }
      });
    });

    it('should filter rolls for today', (done) => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const mockRolls = [
        createMockRollResult(20, '1d20', today),
        createMockRollResult(10, '1d20', yesterday),
      ];

      historieServiceSpy.getAllHistory.and.returnValue(mockRolls);
      historySubject.next(mockRolls);

      service.setTimeFilter('today');

      service.stats$.subscribe((stats) => {
        if (stats) {
          expect(stats.basic.totalRolls).toBe(1);
          expect(stats.basic.totalSum).toBe(20);
          done();
        }
      });
    });

    it('should filter rolls for session', (done) => {
      const sessionStart = new Date();
      sessionStart.setMinutes(sessionStart.getMinutes() - 30);

      const beforeSession = new Date();
      beforeSession.setHours(beforeSession.getHours() - 2);

      const mockRolls = [
        createMockRollResult(20, '1d20', new Date()),
        createMockRollResult(10, '1d20', beforeSession),
      ];

      historieServiceSpy.getAllHistory.and.returnValue(mockRolls);
      historieServiceSpy.getSessionStartTime.and.returnValue(sessionStart);
      historySubject.next(mockRolls);

      service.setTimeFilter('session');

      service.stats$.subscribe((stats) => {
        if (stats) {
          expect(stats.basic.totalRolls).toBe(1);
          done();
        }
      });
    });

    it('should show all rolls with "all" filter', (done) => {
      const today = new Date();
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);

      const mockRolls = [
        createMockRollResult(20, '1d20', today),
        createMockRollResult(10, '1d20', lastWeek),
      ];

      historieServiceSpy.getAllHistory.and.returnValue(mockRolls);
      historySubject.next(mockRolls);

      service.setTimeFilter('all');

      service.stats$.subscribe((stats) => {
        if (stats) {
          expect(stats.basic.totalRolls).toBe(2);
          done();
        }
      });
    });
  });

  describe('exportAsJSON', () => {
    it('should return error message when no stats', () => {
      const json = service.exportAsJSON();
      const parsed = JSON.parse(json);
      expect(parsed.error).toBe('No statistics available');
    });

    it('should export valid JSON with stats', (done) => {
      const mockRolls = [createMockRollResult(15, '1d20'), createMockRollResult(10, '1d20')];

      historieServiceSpy.getAllHistory.and.returnValue(mockRolls);
      historySubject.next(mockRolls);

      setTimeout(() => {
        const json = service.exportAsJSON();
        const parsed = JSON.parse(json);

        expect(parsed.exportedAt).toBeTruthy();
        expect(parsed.timeFilter).toBe('all');
        expect(parsed.statistics).toBeTruthy();
        expect(parsed.statistics.basicMetrics).toBeTruthy();
        expect(parsed.statistics.criticalStats).toBeTruthy();
        expect(parsed.statistics.distribution).toBeTruthy();
        expect(parsed.statistics.diceTypeAnalysis).toBeTruthy();
        expect(parsed.metadata.appVersion).toBe('1.0.0');
        expect(parsed.metadata.exportFormat).toBe('dnd-dicer-stats-v1');
        done();
      }, 50);
    });
  });

  describe('exportAsCSV', () => {
    it('should return error message when no stats', () => {
      const csv = service.exportAsCSV();
      expect(csv).toBe('No statistics available');
    });

    it('should export valid CSV with stats', (done) => {
      const mockRolls = [createMockRollResult(15, '1d20'), createMockRollResult(10, '1d20')];

      historieServiceSpy.getAllHistory.and.returnValue(mockRolls);
      historySubject.next(mockRolls);

      setTimeout(() => {
        const csv = service.exportAsCSV();

        expect(csv).toContain('D&D Dicer Statistics Export');
        expect(csv).toContain('BASIC METRICS');
        expect(csv).toContain('Total Rolls,2');
        expect(csv).toContain('RESULT DISTRIBUTION');
        expect(csv).toContain('DICE TYPE ANALYSIS');
        done();
      }, 50);
    });

    it('should include critical stats when d20 rolls exist', (done) => {
      const mockRolls = [
        createMockRollResult(20, '1d20', new Date(), [{ value: 20, isDropped: false }]),
        createMockRollResult(1, '1d20', new Date(), [{ value: 1, isDropped: false }]),
      ];

      historieServiceSpy.getAllHistory.and.returnValue(mockRolls);
      historySubject.next(mockRolls);

      setTimeout(() => {
        const csv = service.exportAsCSV();
        expect(csv).toContain('CRITICAL STATS (d20)');
        expect(csv).toContain('Natural 20');
        expect(csv).toContain('Natural 1');
        done();
      }, 50);
    });
  });

  describe('reactive updates', () => {
    it('should recalculate when history changes', (done) => {
      let updateCount = 0;

      service.stats$.subscribe((stats) => {
        updateCount++;

        if (updateCount === 2 && stats) {
          expect(stats.basic.totalRolls).toBe(2);
          done();
        }
      });

      const mockRolls = [createMockRollResult(15), createMockRollResult(10)];

      historieServiceSpy.getAllHistory.and.returnValue(mockRolls);
      historySubject.next(mockRolls);
    });
  });
});
