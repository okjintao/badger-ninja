import {
  Network,
  PriceSummary,
  TokenConfiguration,
  VaultDTOV2,
} from '@badger-dao/sdk';

export interface NetworkSummary {
  name: string;
  network: Network;
  tvl: number;
  vaults: VaultDTOV2[];
  tokens: TokenConfiguration;
  prices: PriceSummary;
}
