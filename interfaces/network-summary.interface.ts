import {
  Network,
  PriceSummary,
  TokenConfiguration,
  VaultDTOV3,
} from '@badger-dao/sdk';

export interface NetworkSummary {
  name: string;
  network: Network;
  tvl: number;
  vaults: VaultDTOV3[];
  tokens: TokenConfiguration;
  prices: PriceSummary;
}
