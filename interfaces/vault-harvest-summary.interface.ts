import { Network, VaultYieldProjection } from '@badger-dao/sdk';

export interface VaultHarvestSummary {
  name: string;
  yieldProjection: VaultYieldProjection;
  networkName: string;
  network: Network;
  lastHarvest: number;
}
