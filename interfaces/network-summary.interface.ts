import { Network, VaultDTO } from "@badger-dao/sdk";

export interface NetworkSummary {
  name: string;
  network: Network;
  tvl: number;
  vaults: VaultDTO[];
}