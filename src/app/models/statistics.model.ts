export type TimeFilter = 'today' | 'session' | 'all';

export interface BasicMetrics {
  totalRolls: number;
  averageResult: number;
  minResult: number;
  maxResult: number;
  totalSum: number;
}

export interface CriticalStats {
  nat20Count: number;
  nat20Percentage: number;
  nat1Count: number;
  nat1Percentage: number;
  totalD20Rolls: number;
}

export interface DistributionEntry {
  value: number;
  count: number;
  percentage: number;
}

export interface DiceTypeStat {
  diceType: string;
  count: number;
  averageResult: number;
}

export interface StatisticsData {
  basic: BasicMetrics;
  critical: CriticalStats;
  distribution: DistributionEntry[];
  diceTypes: DiceTypeStat[];
  timeFilter: TimeFilter;
  lastUpdated: Date;
}
