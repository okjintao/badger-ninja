import { VaultDTO } from "@badger-dao/sdk";

export interface NetworkSummary {
  vaults: VaultDTO[];
  tvl: number;
  name: string;
}