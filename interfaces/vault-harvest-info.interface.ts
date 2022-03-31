import { RewardType } from '../enums/reward-type.enum';

export interface VaultHarvestInfo {
  rewardType: RewardType;
  token: string;
  amount: number;
  value: number;
  duration: number;
  apr: number;
  timestamp: number;
  hash: string;
}
