import BadgerSDK, {
  Currency,
  Network,
  VaultState,
  VaultVersion,
  ONE_MINUTE_MS,
  getNetworkConfig,
  SDKProvider,
} from '@badger-dao/sdk';
import { BigNumber } from 'ethers';
import { makeAutoObservable } from 'mobx';
import { getBadgerApiUrl } from '../config/config.utils';

import { NetworkSummary } from '../interfaces/network-summary.interface';
import { VaultHarvestSummaries } from '../interfaces/vault-harvest-summaries.interface';
import { VaultHarvestSummary } from '../interfaces/vault-harvest-summary.interface';
import { RootStore } from './RootStore';

export class ProtocolStore {
  private registryCache: Record<string, Record<string, string>> = {};

  public initialized = false;
  public networks: Record<string, NetworkSummary> = Object.fromEntries(
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
  public vaultHarviestSummaries: VaultHarvestSummaries = {
    alertVaults: [],
    borderlineVaults: [],
    healthyVaults: [],
  };
  public registryEntries: Record<string, string> = {};

  constructor(private store: RootStore) {
    makeAutoObservable(this);
    setInterval(async () => this.loadProtocolData(), ONE_MINUTE_MS);
  }

  async loadProtocolData() {
    if (Date.now() - this.store.updatedAt < ONE_MINUTE_MS) {
      return;
    }
    const {
      sdk: { api },
    } = this.store;
    await Promise.all(
      Object.values(Network).map(async (network) => {
        if (
          network === Network.Local ||
          network == Network.Optimism ||
          network === Network.Avalanche
        ) {
          return;
        }

        try {
          const [networkVaults, tokens, prices] = await Promise.all([
            api.loadVaultsV3(Currency.USD, network),
            api.loadTokens(network),
            api.loadPrices(Currency.USD, network),
          ]);
          this.networks[network].vaults = networkVaults.filter(
            (v) => v.state !== VaultState.Discontinued,
          );
          this.networks[network].tvl = networkVaults.reduce(
            (total, v) => (total += v.value),
            0,
          );
          this.networks[network].tokens = tokens;
          this.networks[network].prices = prices;
        } catch {} // some network is not supported
      }),
    );
    this.vaultHarviestSummaries = this.evaluateVaultHarvests();
    this.initialized = true;
  }

  private evaluateVaultHarvests() {
    const alertVaults: VaultHarvestSummary[] = [];
    const borderlineVaults: VaultHarvestSummary[] = [];
    const healthyVaults: VaultHarvestSummary[] = [];

    for (const [network, summary] of Object.entries(this.networks)) {
      const { vaults } = summary;

      const networkName = network
        .split('-')
        .map((i) => i.charAt(0).toUpperCase() + i.slice(1))
        .join(' ');

      vaults
        .filter(
          (v) =>
            v.state !== VaultState.Discontinued &&
            v.version === VaultVersion.v1_5,
        )
        .forEach((v) => {
          const summary: VaultHarvestSummary = {
            network: network as Network,
            networkName,
            name: v.name,
            yieldProjection: v.yieldProjection,
            address: v.vaultToken,
          };
          const { harvestValue, yieldValue } = v.yieldProjection;
          const harvestHealth = (harvestValue / yieldValue) * 100;
          if (harvestHealth >= 97) {
            healthyVaults.push(summary);
          } else if (harvestHealth >= 94) {
            borderlineVaults.push(summary);
          } else if (harvestHealth < 94) {
            alertVaults.push(summary);
          }
        });
    }

    return {
      alertVaults,
      borderlineVaults,
      healthyVaults,
    };
  }

  async loadRegistry(targetNetwork: Network) {
    if (this.registryCache[targetNetwork]) {
      this.registryEntries = this.registryCache[targetNetwork];
      return;
    }

    const rpc: Record<string, string> = {
      [Network.Ethereum]:
        'https://eth-mainnet.gateway.pokt.network/v1/5f3453978e354ab992c4da79',
      [Network.Fantom]: 'https://rpc.ftm.tools/',
      [Network.Arbitrum]: 'https://arb1.arbitrum.io/rpc',
    };

    const sdk = new BadgerSDK({
      network: targetNetwork,
      provider: rpc[targetNetwork],
      baseURL: getBadgerApiUrl(),
    });
    await sdk.ready();

    if (!sdk.registry.hasRegistry()) {
      return;
    }

    const { registry } = sdk;
    const keysCount = await registry.keysCount();
    if (keysCount > 0) {
      const iteratee = new Array(keysCount).fill(0);
      const entries = await Promise.all(
        iteratee.map(async (_, i) => {
          const key = await registry.registry.keys(i);
          const value = await registry.get(key);
          return [key, value ?? ''];
        }),
      );
      this.registryEntries = Object.fromEntries(entries);
    }
  }
}
