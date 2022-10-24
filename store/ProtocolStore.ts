import BadgerSDK, {
  Currency,
  Network,
  VaultState,
  VaultVersion,
  ONE_MINUTE_MS,
  getNetworkConfig,
} from '@badger-dao/sdk';
import { BigNumber } from 'ethers';
import { makeAutoObservable } from 'mobx';

import { NetworkSummary } from '../interfaces/network-summary.interface';
import { VaultHarvestSummaries } from '../interfaces/vault-harvest-summaries.interface';
import { VaultHarvestSummary } from '../interfaces/vault-harvest-summary.interface';
import { RootStore } from './RootStore';

export class ProtocolStore {
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
    const { network } = this.store.sdk.config;

    if (network !== targetNetwork) {
      this.registryEntries = {};
      const config = getNetworkConfig(targetNetwork);
      // ethereum is just the injected provider (mm) as all chains are canonically ethereum
      const { ethereum } = window;
      // implementation details from:
      // https://docs.metamask.io/guide/rpc-api.html#other-rpc-methods
      if (ethereum) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          await ethereum.request!({
            method: 'wallet_switchEthereumChain',
            params: [
              {
                chainId: `0x${config.chainId.toString(16)}`,
              },
            ],
          });
        } catch (err) {
          // TODO: handle adding networks later
          // if (err.code === 4001) {
          //   throw new Error('User rejected request');
          // }
          // // This error code indicates that the chain has not been added to MetaMask.
          // if (err.code === 4902) {
          //   try {
          //     // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          //     await ethereum.request!({
          //       method: 'wallet_addEthereumChain',
          //       params: [
          //         {
          //           chainId: BigNumber.from(config.chainId).toHexString(),
          //           chainName: config.name,
          //           nativeCurrency: {
          //             name: config.name,
          //             symbol: config.currencySymbol,
          //             decimals: 18,
          //           },
          //           rpcUrls: [DEFAULT_RPC[config.network]],
          //           blockExplorerUrls: [config.explorerUrl],
          //         },
          //       ],
          //     });
          //   } catch {
          //     throw err;
          //   }
          // }
          console.error(
            'Unable to change networks, you might be missing target network configuration',
          );
        }
      }

      this.store.user.updateNetwork(targetNetwork);
    }

    await this.store.sdk.ready();
    const { network: updatedNetwork } = this.store.sdk.config;

    if (!this.store.sdk.registry.hasRegistry()) {
      return;
    }

    const { registry } = this.store.sdk;

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
