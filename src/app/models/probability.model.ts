import { DiceExpression } from './dice-expression.model';

/**
 * Represents a single point in a probability distribution.
 */
export interface ProbabilityDistribution {
  /** The result value (e.g., total of dice roll) */
  value: number;
  /** Probability as decimal (0-1) */
  probability: number;
  /** Probability as percentage (0-100) */
  percentage: number;
  /** Cumulative probability P(result <= value) as percentage */
  cumulative: number;
}

/**
 * Complete probability analysis result for a dice expression.
 */
export interface ProbabilityResult {
  /** The dice expression that was analyzed */
  expression: DiceExpression;
  /** Human-readable dice notation (e.g., "2d20kh1 + 5") */
  notation: string;
  /** Probability distribution sorted by value ascending */
  distribution: ProbabilityDistribution[];
  /** Minimum possible result value */
  minValue: number;
  /** Maximum possible result value */
  maxValue: number;
  /** Expected value (mathematical mean) */
  expectedValue: number;
  /** Median value (50th percentile) */
  median: number;
  /** Most likely value(s) - mode of the distribution */
  mode: number[];
  /** Method used for calculation */
  calculationMethod: 'exact' | 'simulation';
  /** Number of simulation runs (only if method is 'simulation') */
  simulationRuns?: number;
  /** Timestamp when calculation was performed */
  timestamp: Date;
}

/**
 * Success probability for reaching a target DC (Difficulty Class).
 */
export interface SuccessProbability {
  /** Target DC value */
  targetDC: number;
  /** Probability of success (total >= DC) as decimal (0-1) */
  probability: number;
  /** Probability of success as percentage (0-100) */
  percentage: number;
}

/**
 * Critical roll probabilities for d20 rolls.
 * Only applicable to expressions containing d20 dice.
 */
export interface CriticalProbabilities {
  /** Probability of rolling a natural 20 as percentage */
  nat20Probability: number;
  /** Probability of rolling a natural 1 as percentage */
  nat1Probability: number;
}
