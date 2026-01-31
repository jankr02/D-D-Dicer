import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Historie } from './historie';
import {
  StatisticsData,
  BasicMetrics,
  CriticalStats,
  DistributionEntry,
  DiceTypeStat,
  TimeFilter,
  RollResult,
} from '../models';

/**
 * Statistics Service - Calculates and manages statistics from roll history.
 *
 * Provides reactive statistics updates when roll history changes.
 * Supports time filtering (today, session, all).
 * Exports statistics to JSON and CSV formats.
 */
@Injectable({
  providedIn: 'root',
})
export class Statistics {
  private statsSubject = new BehaviorSubject<StatisticsData | null>(null);
  public stats$ = this.statsSubject.asObservable();
  private currentTimeFilter: TimeFilter = 'all';

  constructor(private historieService: Historie) {
    // Subscribe to history changes and recalculate stats
    this.historieService.history$.subscribe(() => {
      this.calculateStatistics();
    });
  }

  /**
   * Sets the time filter and triggers recalculation.
   *
   * @param filter The time filter to apply
   */
  setTimeFilter(filter: TimeFilter): void {
    this.currentTimeFilter = filter;
    this.calculateStatistics();
  }

  /**
   * Main calculation method that computes all statistics.
   * Called when history changes or time filter is updated.
   */
  private calculateStatistics(): void {
    const allRolls = this.historieService.getAllHistory();
    const filteredRolls = this.filterRollsByTime(allRolls, this.currentTimeFilter);

    if (filteredRolls.length === 0) {
      this.statsSubject.next(null);
      return;
    }

    const stats: StatisticsData = {
      basic: this.calculateBasicMetrics(filteredRolls),
      critical: this.calculateCriticalStats(filteredRolls),
      distribution: this.calculateDistribution(filteredRolls),
      diceTypes: this.calculateDiceTypeAnalysis(filteredRolls),
      timeFilter: this.currentTimeFilter,
      lastUpdated: new Date(),
    };

    this.statsSubject.next(stats);
  }

  /**
   * Calculates basic metrics (average, min, max, total).
   *
   * @param rolls Roll results to analyze
   * @returns Basic metrics
   */
  private calculateBasicMetrics(rolls: RollResult[]): BasicMetrics {
    if (rolls.length === 0) {
      return {
        totalRolls: 0,
        averageResult: 0,
        minResult: 0,
        maxResult: 0,
        totalSum: 0,
      };
    }

    const totals = rolls.map(r => r.total);
    const totalSum = totals.reduce((sum, val) => sum + val, 0);

    return {
      totalRolls: rolls.length,
      averageResult: Math.round((totalSum / rolls.length) * 100) / 100,
      minResult: Math.min(...totals),
      maxResult: Math.max(...totals),
      totalSum: totalSum,
    };
  }

  /**
   * Checks if a roll is a pure d20 roll (for critical detection).
   *
   * @param result Roll result to check
   * @returns True if this is a single d20 roll without modifiers
   */
  private isD20Roll(result: RollResult): boolean {
    // Must be single group
    if (result.groupResults.length !== 1) return false;

    const group = result.groupResults[0];
    const activeRolls = group.rolls.filter(r => !r.isDropped);

    // Must be single die roll with value 1-20 and no modifier
    return (
      activeRolls.length === 1 &&
      activeRolls[0].value >= 1 &&
      activeRolls[0].value <= 20 &&
      result.modifier === 0
    );
  }

  /**
   * Calculates critical success/failure statistics for d20 rolls.
   *
   * @param rolls Roll results to analyze
   * @returns Critical stats (nat 20/nat 1 counts and percentages)
   */
  private calculateCriticalStats(rolls: RollResult[]): CriticalStats {
    const d20Rolls = rolls.filter(r => this.isD20Roll(r));

    if (d20Rolls.length === 0) {
      return {
        nat20Count: 0,
        nat20Percentage: 0,
        nat1Count: 0,
        nat1Percentage: 0,
        totalD20Rolls: 0,
      };
    }

    const nat20Count = d20Rolls.filter(
      r => r.groupResults[0].rolls[0].value === 20
    ).length;

    const nat1Count = d20Rolls.filter(
      r => r.groupResults[0].rolls[0].value === 1
    ).length;

    return {
      nat20Count,
      nat20Percentage: Math.round((nat20Count / d20Rolls.length) * 10000) / 100,
      nat1Count,
      nat1Percentage: Math.round((nat1Count / d20Rolls.length) * 10000) / 100,
      totalD20Rolls: d20Rolls.length,
    };
  }

  /**
   * Calculates result distribution (frequency of each total value).
   *
   * @param rolls Roll results to analyze
   * @returns Array of distribution entries sorted by value
   */
  private calculateDistribution(rolls: RollResult[]): DistributionEntry[] {
    if (rolls.length === 0) return [];

    // Count occurrences of each total value
    const countMap = new Map<number, number>();

    rolls.forEach(roll => {
      const current = countMap.get(roll.total) || 0;
      countMap.set(roll.total, current + 1);
    });

    // Convert to array and calculate percentages
    const distribution = Array.from(countMap.entries())
      .map(([value, count]) => ({
        value,
        count,
        percentage: Math.round((count / rolls.length) * 10000) / 100,
      }))
      .sort((a, b) => a.value - b.value); // Sort by value

    return distribution;
  }

  /**
   * Extracts dice types from a roll notation string.
   *
   * @param result Roll result with notation
   * @returns Array of dice types (e.g., ["d20", "d6"])
   */
  private extractDiceTypes(result: RollResult): string[] {
    // Parse notation to extract dice types
    // Example: "2d20kh1 + 3d6 + 5" -> ["d20", "d6"]
    const dicePattern = /(\d+)?d(\d+)/gi;
    const matches = result.notation.matchAll(dicePattern);

    const types: string[] = [];
    for (const match of matches) {
      const diceType = `d${match[2]}`;
      types.push(diceType);
    }

    return types;
  }

  /**
   * Calculates dice type usage statistics.
   *
   * @param rolls Roll results to analyze
   * @returns Array of dice type stats sorted by usage (most used first)
   */
  private calculateDiceTypeAnalysis(rolls: RollResult[]): DiceTypeStat[] {
    const typeMap = new Map<
      string,
      { count: number; totalSum: number; rollCount: number }
    >();

    rolls.forEach(roll => {
      const types = this.extractDiceTypes(roll);

      types.forEach(type => {
        if (!typeMap.has(type)) {
          typeMap.set(type, { count: 0, totalSum: 0, rollCount: 0 });
        }

        const stat = typeMap.get(type)!;
        stat.count++;
        stat.totalSum += roll.total;
        stat.rollCount++;
      });
    });

    return Array.from(typeMap.entries())
      .map(([diceType, data]) => ({
        diceType,
        count: data.count,
        averageResult: Math.round((data.totalSum / data.rollCount) * 100) / 100,
      }))
      .sort((a, b) => b.count - a.count); // Sort by usage (most used first)
  }

  /**
   * Filters rolls by the specified time period.
   *
   * @param rolls All rolls
   * @param filter Time filter to apply
   * @returns Filtered rolls
   */
  private filterRollsByTime(rolls: RollResult[], filter: TimeFilter): RollResult[] {
    if (filter === 'all') return rolls;

    const now = new Date();

    if (filter === 'today') {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return rolls.filter(r => new Date(r.timestamp) >= todayStart);
    }

    if (filter === 'session') {
      const sessionStart = this.historieService.getSessionStartTime();
      return rolls.filter(r => new Date(r.timestamp) >= sessionStart);
    }

    return rolls;
  }

  /**
   * Exports current statistics as JSON string.
   *
   * @returns JSON string with statistics data
   */
  exportAsJSON(): string {
    const stats = this.statsSubject.value;

    if (!stats) {
      return JSON.stringify({ error: 'No statistics available' });
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      timeFilter: stats.timeFilter,
      statistics: {
        basicMetrics: stats.basic,
        criticalStats: stats.critical,
        distribution: stats.distribution,
        diceTypeAnalysis: stats.diceTypes,
      },
      metadata: {
        appVersion: '1.0.0',
        exportFormat: 'dnd-dicer-stats-v1',
      },
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Exports current statistics as CSV string.
   *
   * @returns CSV string with statistics data
   */
  exportAsCSV(): string {
    const stats = this.statsSubject.value;

    if (!stats) {
      return 'No statistics available';
    }

    let csv = 'D&D Dicer Statistics Export\n';
    csv += `Exported At: ${new Date().toISOString()}\n`;
    csv += `Time Filter: ${stats.timeFilter}\n\n`;

    // Basic Metrics
    csv += 'BASIC METRICS\n';
    csv += 'Metric,Value\n';
    csv += `Total Rolls,${stats.basic.totalRolls}\n`;
    csv += `Average Result,${stats.basic.averageResult}\n`;
    csv += `Minimum,${stats.basic.minResult}\n`;
    csv += `Maximum,${stats.basic.maxResult}\n`;
    csv += `Total Sum,${stats.basic.totalSum}\n\n`;

    // Critical Stats
    if (stats.critical.totalD20Rolls > 0) {
      csv += 'CRITICAL STATS (d20)\n';
      csv += 'Type,Count,Percentage\n';
      csv += `Natural 20,${stats.critical.nat20Count},${stats.critical.nat20Percentage}%\n`;
      csv += `Natural 1,${stats.critical.nat1Count},${stats.critical.nat1Percentage}%\n`;
      csv += `Total d20 Rolls,${stats.critical.totalD20Rolls},-\n\n`;
    }

    // Distribution
    csv += 'RESULT DISTRIBUTION\n';
    csv += 'Result Value,Count,Percentage\n';
    stats.distribution.forEach(entry => {
      csv += `${entry.value},${entry.count},${entry.percentage}%\n`;
    });
    csv += '\n';

    // Dice Types
    csv += 'DICE TYPE ANALYSIS\n';
    csv += 'Dice Type,Usage Count,Average Result\n';
    stats.diceTypes.forEach(type => {
      csv += `${type.diceType},${type.count},${type.averageResult}\n`;
    });

    return csv;
  }
}
