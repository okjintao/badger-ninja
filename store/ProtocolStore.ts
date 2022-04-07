import { Currency, Network, VaultState } from '@badger-dao/sdk';
import { makeAutoObservable } from 'mobx';
import { NetworkSummary } from '../interfaces/network-summary.interface';
import { RootStore } from './RootStore';

export class ProtocolStore {
  public initialized = false;
  public lastUpdatedAt = Date.now();
  public networks: Record<string, NetworkSummary>;

  constructor(private store: RootStore) {
    this.networks = Object.fromEntries(
      Object.values(Network).map((n) => {
        const networkName = n
          .split('-')
          .map((i) => i.charAt(0).toUpperCase() + i.slice(1))
          .join(' ');
        const summary: NetworkSummary = {
          vaults: [],
          tvl: 0,
          name: networkName,
          network: n,
          tokens: {},
          prices: {},
        };
        return [n, summary];
      }),
    );

    setInterval(async () => this.loadProtocolData(), 60_000);

    makeAutoObservable(this);
  }

  async loadProtocolData() {
    const { sdk } = this.store;
    for (const network of Object.values(Network)) {
      try {
        const networkVaults = await sdk.api.loadVaults(Currency.USD, network);
        this.networks[network].vaults = networkVaults.filter(
          (v) => v.state !== VaultState.Discontinued,
        );
        this.networks[network].tvl = networkVaults.reduce(
          (total, v) => (total += v.value),
          0,
        );
        this.networks[network].tokens = await sdk.api.loadTokens();
        this.networks[network].prices = await sdk.api.loadPrices(
          Currency.USD,
          network,
        );
      } catch {} // some network are not supported
    }
    this.initialized = true;
    this.lastUpdatedAt = Date.now();
  }
}
