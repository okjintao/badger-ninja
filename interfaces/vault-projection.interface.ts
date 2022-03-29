import { Protocol, VaultStrategy } from "@badger-dao/sdk";

export interface VaultProjection {
  name: string;
  vaultToken: string;
  underlyingToken: string;
  strategy: VaultStrategy;
  protocol: Protocol;
  value: number;
  apr: number;
  aprDisplay: string;
  lastHarvest: number;
}