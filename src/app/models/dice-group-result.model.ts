export interface IndividualRoll {
  value: number;
  isDropped: boolean;
}

export interface DiceGroupResult {
  rolls: IndividualRoll[];
  groupSum: number;
}
