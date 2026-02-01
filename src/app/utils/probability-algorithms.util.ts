import { KeepDropType } from '../types/dice-types';
import { ProbabilityDistribution } from '../models';

/**
 * Calculates uniform probability distribution for a die with given sides.
 *
 * @param sides Number of sides on the die (e.g., 6 for d6, 37 for d37)
 * @returns Map of value -> probability (uniform distribution)
 */
export function calculateDieDistribution(
  sides: number
): Map<number, number> {
  const distribution = new Map<number, number>();
  const probability = 1 / sides;

  for (let i = 1; i <= sides; i++) {
    distribution.set(i, probability);
  }

  return distribution;
}

/**
 * Convolves two probability distributions (for adding independent dice groups).
 *
 * @param dist1 First distribution
 * @param dist2 Second distribution
 * @returns Combined distribution representing sum of both
 */
export function convolve(
  dist1: Map<number, number>,
  dist2: Map<number, number>
): Map<number, number> {
  const result = new Map<number, number>();

  for (const [value1, prob1] of dist1.entries()) {
    for (const [value2, prob2] of dist2.entries()) {
      const sum = value1 + value2;
      const currentProb = result.get(sum) || 0;
      result.set(sum, currentProb + prob1 * prob2);
    }
  }

  return result;
}

/**
 * Applies keep/drop logic to a dice distribution.
 * This enumerates all possible combinations and calculates the resulting distribution.
 *
 * @param diceCount Number of dice rolled
 * @param sides Number of sides on each die (e.g., 6 for d6, 37 for d37)
 * @param keepDropType Type of keep/drop operation
 * @param keepDropCount Number of dice to keep/drop
 * @returns Distribution after applying keep/drop logic
 */
export function applyKeepDrop(
  diceCount: number,
  sides: number,
  keepDropType: KeepDropType,
  keepDropCount: number
): Map<number, number> {
  const faces = sides;
  const outcomes = new Map<number, number>();

  // Generate all possible dice combinations
  const totalCombinations = Math.pow(faces, diceCount);

  for (let i = 0; i < totalCombinations; i++) {
    // Convert combination index to dice values
    const diceValues: number[] = [];
    let temp = i;
    for (let d = 0; d < diceCount; d++) {
      diceValues.push((temp % faces) + 1);
      temp = Math.floor(temp / faces);
    }

    // Sort dice values for keep/drop logic
    const sorted = [...diceValues].sort((a, b) => a - b);

    // Apply keep/drop
    let keptDice: number[];
    switch (keepDropType) {
      case KeepDropType.KEEP_HIGHEST:
        keptDice = sorted.slice(-keepDropCount);
        break;
      case KeepDropType.KEEP_LOWEST:
        keptDice = sorted.slice(0, keepDropCount);
        break;
      case KeepDropType.DROP_HIGHEST:
        keptDice = sorted.slice(0, diceCount - keepDropCount);
        break;
      case KeepDropType.DROP_LOWEST:
        keptDice = sorted.slice(keepDropCount);
        break;
      default:
        keptDice = sorted;
    }

    // Calculate sum of kept dice
    const sum = keptDice.reduce((a, b) => a + b, 0);

    // Increment outcome count
    const count = outcomes.get(sum) || 0;
    outcomes.set(sum, count + 1);
  }

  // Convert counts to probabilities
  const distribution = new Map<number, number>();
  for (const [value, count] of outcomes.entries()) {
    distribution.set(value, count / totalCombinations);
  }

  return distribution;
}

/**
 * Normalizes a count map to a probability distribution array.
 * Converts raw counts to percentages and adds cumulative probabilities.
 *
 * @param countMap Map of value -> count
 * @returns Sorted array of ProbabilityDistribution
 */
export function normalizeDistribution(
  countMap: Map<number, number>
): ProbabilityDistribution[] {
  const totalCount = Array.from(countMap.values()).reduce((a, b) => a + b, 0);

  if (totalCount === 0) {
    return [];
  }

  // Convert to array and sort by value
  const distribution: ProbabilityDistribution[] = [];
  const sortedEntries = Array.from(countMap.entries()).sort((a, b) => a[0] - b[0]);

  let cumulativeProb = 0;

  for (const [value, count] of sortedEntries) {
    const probability = count / totalCount;
    const percentage = probability * 100;
    cumulativeProb += percentage;

    distribution.push({
      value,
      probability,
      percentage,
      cumulative: cumulativeProb,
    });
  }

  return distribution;
}

/**
 * Calculates the expected value (mean) of a probability distribution.
 *
 * @param distribution Probability distribution map
 * @returns Expected value (weighted average)
 */
export function calculateExpectedValue(
  distribution: Map<number, number>
): number {
  let expectedValue = 0;

  for (const [value, probability] of distribution.entries()) {
    expectedValue += value * probability;
  }

  return expectedValue;
}

/**
 * Calculates the median (50th percentile) of a probability distribution.
 *
 * @param distribution Sorted array of ProbabilityDistribution
 * @returns Median value
 */
export function calculateMedian(
  distribution: ProbabilityDistribution[]
): number {
  let cumulativeProb = 0;

  for (const entry of distribution) {
    cumulativeProb += entry.probability;
    if (cumulativeProb >= 0.5) {
      return entry.value;
    }
  }

  return distribution[distribution.length - 1]?.value || 0;
}

/**
 * Calculates the mode (most likely value(s)) of a probability distribution.
 *
 * @param distribution Array of ProbabilityDistribution
 * @returns Array of most likely values (can be multiple if tied)
 */
export function calculateMode(
  distribution: ProbabilityDistribution[]
): number[] {
  if (distribution.length === 0) {
    return [];
  }

  const maxProbability = Math.max(...distribution.map(d => d.probability));
  return distribution
    .filter(d => Math.abs(d.probability - maxProbability) < 0.0001) // Account for floating point precision
    .map(d => d.value);
}

