import { Injectable } from '@angular/core';
import { DiceRoller } from './dice-roller';
import {
  DiceExpression,
  ProbabilityResult,
  SuccessProbability,
  CriticalProbabilities,
} from '../models';
import { DiceType, AdvantageType, KeepDropType } from '../types/dice-types';
import { generateNotation } from '../utils/dice-notation.util';
import {
  calculateDieDistribution,
  convolve,
  applyKeepDrop,
  normalizeDistribution,
  calculateExpectedValue,
  calculateMedian,
  calculateMode,
} from '../utils/probability-algorithms.util';

/**
 * ProbabilityCalculator Service - Calculates probabilities for dice expressions.
 *
 * Supports both exact calculation (for simple expressions) and Monte Carlo
 * simulation (for complex expressions). Implements LRU caching for performance.
 */
@Injectable({
  providedIn: 'root',
})
export class ProbabilityCalculator {
  private cache = new Map<string, ProbabilityResult>();
  private cacheKeys: string[] = [];
  private readonly MAX_CACHE_SIZE = 100;
  private readonly SIMULATION_THRESHOLD = 10_000;
  private readonly DEFAULT_SIMULATION_RUNS = 100_000;

  constructor(private diceRoller: DiceRoller) {}

  /**
   * Calculates complete probability analysis for a dice expression.
   * Automatically chooses between exact calculation and Monte Carlo simulation.
   *
   * @param expression The dice expression to analyze
   * @returns Complete probability result
   */
  calculateProbabilities(expression: DiceExpression): ProbabilityResult {
    // Validate expression
    if (!expression.groups || expression.groups.length === 0) {
      throw new Error('DiceExpression must contain at least one group');
    }

    // Check cache first
    const cacheKey = this.getCacheKey(expression);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    // Decide calculation method
    const useSimulation = this.shouldUseSimulation(expression);

    // Calculate distribution
    const distributionMap = useSimulation
      ? this.calculateSimulation(expression, this.DEFAULT_SIMULATION_RUNS)
      : this.calculateExact(expression);

    // Normalize distribution
    const distribution = normalizeDistribution(distributionMap);

    // Calculate statistics
    const expectedValue = calculateExpectedValue(distributionMap);
    const median = calculateMedian(distribution);
    const mode = calculateMode(distribution);

    // Get min/max values
    const values = Array.from(distributionMap.keys());
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    // Build result
    const result: ProbabilityResult = {
      expression,
      notation: generateNotation(expression),
      distribution,
      minValue,
      maxValue,
      expectedValue,
      median,
      mode,
      calculationMethod: useSimulation ? 'simulation' : 'exact',
      simulationRuns: useSimulation ? this.DEFAULT_SIMULATION_RUNS : undefined,
      timestamp: new Date(),
    };

    // Cache result
    this.addToCache(cacheKey, result);

    return result;
  }

  /**
   * Quickly calculates success probability for a target DC.
   *
   * @param expression The dice expression
   * @param targetDC Target difficulty class
   * @returns Success probability (P(total >= DC))
   */
  getSuccessProbability(
    expression: DiceExpression,
    targetDC: number
  ): SuccessProbability {
    const probResult = this.calculateProbabilities(expression);

    // Sum probabilities for all values >= targetDC
    const successProb = probResult.distribution
      .filter(d => d.value >= targetDC)
      .reduce((sum, d) => sum + d.probability, 0);

    return {
      targetDC,
      probability: successProb,
      percentage: successProb * 100,
    };
  }

  /**
   * Calculates critical roll probabilities (Natural 20 and Natural 1).
   * Only applicable for expressions containing d20 dice.
   *
   * @param expression The dice expression
   * @returns Critical probabilities or null if not applicable
   */
  getCriticalProbabilities(
    expression: DiceExpression
  ): CriticalProbabilities | null {
    // Only applicable if first group is d20
    if (expression.groups.length === 0 || expression.groups[0].type !== DiceType.D20) {
      return null;
    }

    const firstGroup = expression.groups[0];

    // Calculate probabilities based on advantage/disadvantage
    let nat20Prob: number;
    let nat1Prob: number;

    if (expression.advantage === AdvantageType.ADVANTAGE) {
      // Advantage: Roll 2d20, keep highest
      // P(Nat 20) = 1 - P(both < 20) = 1 - (19/20)^2
      nat20Prob = 1 - Math.pow(19 / 20, 2);
      // P(Nat 1) = P(both are 1) = (1/20)^2
      nat1Prob = Math.pow(1 / 20, 2);
    } else if (expression.advantage === AdvantageType.DISADVANTAGE) {
      // Disadvantage: Roll 2d20, keep lowest
      // P(Nat 20) = P(both are 20) = (1/20)^2
      nat20Prob = Math.pow(1 / 20, 2);
      // P(Nat 1) = 1 - P(both > 1) = 1 - (19/20)^2
      nat1Prob = 1 - Math.pow(19 / 20, 2);
    } else if (firstGroup.count === 1) {
      // Normal single d20
      nat20Prob = 1 / 20;
      nat1Prob = 1 / 20;
    } else {
      // Multiple d20s or with keep/drop - use general calculation
      // This is complex, so for now return standard probabilities
      nat20Prob = 1 / 20;
      nat1Prob = 1 / 20;
    }

    return {
      nat20Probability: nat20Prob * 100,
      nat1Probability: nat1Prob * 100,
    };
  }

  /**
   * Decides whether to use simulation or exact calculation.
   *
   * @param expression The dice expression
   * @returns True if simulation should be used
   */
  private shouldUseSimulation(expression: DiceExpression): boolean {
    let totalOutcomes = 1;

    for (const group of expression.groups) {
      const faces = this.getFaces(group.type);
      const diceCount = group.count;

      if (group.keepDrop) {
        // Keep/drop requires enumeration
        // Complexity: faces^diceCount
        totalOutcomes *= Math.pow(faces, diceCount);
      } else {
        // Simple multiplication
        // Complexity: faces^diceCount
        totalOutcomes *= Math.pow(faces, diceCount);
      }

      // Early exit if threshold exceeded
      if (totalOutcomes > this.SIMULATION_THRESHOLD) {
        return true;
      }
    }

    return totalOutcomes > this.SIMULATION_THRESHOLD;
  }

  /**
   * Calculates exact probability distribution using convolution.
   *
   * @param expression The dice expression
   * @returns Distribution map (value -> probability)
   */
  private calculateExact(expression: DiceExpression): Map<number, number> {
    let groups = [...expression.groups];

    // Handle advantage/disadvantage for d20
    if (
      expression.advantage &&
      expression.advantage !== AdvantageType.NONE &&
      groups.length > 0 &&
      groups[0].type === DiceType.D20
    ) {
      // Convert advantage/disadvantage to 2d20kh1 or 2d20kl1
      const advantageGroup = {
        count: 2,
        type: DiceType.D20,
        keepDrop: {
          type: expression.advantage === AdvantageType.ADVANTAGE
            ? KeepDropType.KEEP_HIGHEST
            : KeepDropType.KEEP_LOWEST,
          count: 1,
        },
      };
      groups = [advantageGroup, ...groups.slice(1)];
    }

    // Calculate distribution for each group
    let combinedDistribution = new Map<number, number>([[0, 1]]);

    for (const group of groups) {
      const groupDistribution = this.calculateGroupDistribution(group);
      combinedDistribution = convolve(combinedDistribution, groupDistribution);
    }

    // Apply modifier by shifting the distribution
    if (expression.modifier !== 0) {
      const shiftedDistribution = new Map<number, number>();
      for (const [value, probability] of combinedDistribution.entries()) {
        shiftedDistribution.set(value + expression.modifier, probability);
      }
      combinedDistribution = shiftedDistribution;
    }

    return combinedDistribution;
  }

  /**
   * Calculates probability distribution for a single dice group.
   *
   * @param group The dice group
   * @returns Distribution map for this group
   */
  private calculateGroupDistribution(group: any): Map<number, number> {
    if (group.keepDrop) {
      // Use keep/drop algorithm
      return applyKeepDrop(
        group.count,
        group.type,
        group.keepDrop.type,
        group.keepDrop.count
      );
    } else {
      // Simple case: convolve multiple identical dice
      const singleDie = calculateDieDistribution(group.type);
      let distribution = new Map<number, number>([[0, 1]]);

      for (let i = 0; i < group.count; i++) {
        distribution = convolve(distribution, singleDie);
      }

      return distribution;
    }
  }

  /**
   * Calculates probability distribution using Monte Carlo simulation.
   * Runs multiple simulated rolls and aggregates the results.
   *
   * @param expression The dice expression
   * @param runs Number of simulation runs
   * @returns Distribution map (value -> probability)
   */
  private calculateSimulation(
    expression: DiceExpression,
    runs: number
  ): Map<number, number> {
    const outcomes = new Map<number, number>();

    // Run simulations
    for (let i = 0; i < runs; i++) {
      const result = this.diceRoller.rollExpression(expression);
      const total = result.total;

      const count = outcomes.get(total) || 0;
      outcomes.set(total, count + 1);
    }

    return outcomes;
  }

  /**
   * Generates cache key from dice expression.
   *
   * @param expression The dice expression
   * @returns Cache key (dice notation string)
   */
  private getCacheKey(expression: DiceExpression): string {
    return generateNotation(expression);
  }

  /**
   * Retrieves result from cache if available.
   *
   * @param key Cache key
   * @returns Cached result or null
   */
  private getFromCache(key: string): ProbabilityResult | null {
    if (this.cache.has(key)) {
      // Move to end (most recently used)
      this.cacheKeys = this.cacheKeys.filter(k => k !== key);
      this.cacheKeys.push(key);
      return this.cache.get(key)!;
    }
    return null;
  }

  /**
   * Adds result to cache using LRU eviction policy.
   *
   * @param key Cache key
   * @param result Probability result to cache
   */
  private addToCache(key: string, result: ProbabilityResult): void {
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      // Evict least recently used
      const lruKey = this.cacheKeys.shift()!;
      this.cache.delete(lruKey);
    }
    this.cache.set(key, result);
    this.cacheKeys.push(key);
  }

  /**
   * Gets the number of faces for a dice type.
   *
   * @param diceType The type of die
   * @returns Number of faces
   */
  private getFaces(diceType: DiceType): number {
    const facesMap: Record<DiceType, number> = {
      [DiceType.D4]: 4,
      [DiceType.D6]: 6,
      [DiceType.D8]: 8,
      [DiceType.D10]: 10,
      [DiceType.D12]: 12,
      [DiceType.D20]: 20,
      [DiceType.D100]: 100,
    };

    return facesMap[diceType];
  }
}
