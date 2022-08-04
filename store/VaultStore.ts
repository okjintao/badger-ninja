import {
  ChartTimeFrame,
  formatBalance,
  gqlGenT,
  Network,
  VaultSnapshot,
} from '@badger-dao/sdk';
import {
  Transfer_OrderBy,
  OrderDirection,
  SettHarvest_OrderBy,
  BadgerTreeDistribution_OrderBy,
  TransferFragment,
} from '@badger-dao/sdk/lib/graphql/generated/badger';
import { BigNumber, ethers } from 'ethers';
import { makeAutoObservable } from 'mobx';
import { stringify } from 'querystring';
import { RewardType } from '../enums/reward-type.enum';
import { VaultHarvestInfo } from '../interfaces/vault-harvest-info.interface';
import { VaultProps } from '../pages/vault/[network]/[address]';
import { TransferType } from './enums/transfer-type.enum';
import { VaultTransfer } from './interfaces/vault-transfer.interface';
import { RootStore } from './RootStore';

const BLACKLIST_HARVESTS = [
  '0xfd05D3C7fe2924020620A8bE4961bBaA747e6305',
  '0x53c8e199eb2cb7c01543c137078a038937a68e40',
];

export class VaultStore {
  public chartData: Record<string, VaultSnapshot[]> = {};
  public vaultTransfers: Record<string, VaultTransfer[]> = {};

  constructor(private store: RootStore) {
    makeAutoObservable(this);
  }

  getVaultChart(network: Network, vault: string, timeframe: ChartTimeFrame): VaultSnapshot[] {
    const chartKey = `${network}-${vault}-${timeframe}`;
    return this.chartData[chartKey] ?? [];
  }

  async updateVaults() {
    await Promise.all([
      this.#loadVaultCharts(),
    ]);
  }

  async #loadVaultCharts() {
    const { api } = this.store.sdk;
    await Promise.all(Object.values(this.store.protocol.networks).map(async (n) => {
      await Promise.all(n.vaults.map(async (v) => {
        for (const timeframe of Object.values(ChartTimeFrame)) {
          const chartKey = `${this.#getVaultKey(n.network, v.vaultToken)}-${timeframe}`;
          this.chartData[chartKey] = await api.loadVaultChart(v.vaultToken, timeframe, n.network);
        }
      }));
    }));
  }

  async #loadVaultTransfers(network: Network, address: string): Promise<VaultTransfer[]> {
    const transferKey = this.#getVaultKey(network, address);

    if (this.vaultTransfers[transferKey]) {
      return this.vaultTransfers[transferKey];
    }

    const { graph } = this.store.sdk;
          
    let vaultTransferEvents: TransferFragment[] = [];
    let lastTransfer: string | undefined;
    while (true) {
      try {
        if (vaultTransferEvents.length > 500) {
          break;
        }
        const { transfers } = await graph.loadTransfers({
          first: 100,
          where: { id_gt: lastTransfer, sett: address.toLowerCase() },
          orderBy: gqlGenT.Transfer_OrderBy.Id,
          orderDirection: gqlGenT.OrderDirection.Asc,
        });
        if (transfers.length === 0) {
          break;
        }
        lastTransfer = transfers[transfers.length - 1].id;
        vaultTransferEvents = vaultTransferEvents.concat(transfers);
      } catch {
        break;
      }
    }

    const { tokens } = this.store.protocol.networks[network];
    this.vaultTransfers[transferKey] = vaultTransferEvents.map((t) => {
      const transferType =
        Number(t.to.id) === 0
          ? TransferType.Withdraw
          : Number(t.from.id) === 0
          ? TransferType.Deposit
          : TransferType.Transfer;
      return {
        from: t.from.id,
        to: t.to.id,
        amount: formatBalance(t.amount, tokens[address].decimals),
        date: new Date(t.timestamp * 1000).toLocaleString(),
        type: transferType,
        hash: t.id.split('-')[0],
      };
    });

    return this.vaultTransfers[transferKey];
  }

  #getVaultKey(network: Network, address: string): string {
    return `${network}-${address}`;
  }

  async loadVaultData(network: Network, address: string): Promise<VaultProps> {
    const key = this.#getVaultKey(network, address);
    
    const { api, graph } = this.store.sdk;
    const { tokens, vaults, prices } = this.store.protocol.networks[network];

    const vault = vaults.find((v) => v.vaultToken === address);

    if (!vault || !this.store.protocol.initialized) {
      return {
        chartData: [],
        schedules: [],
        transfers: [],
        network: Network.Ethereum,
        prices: {},
        harvests: [],
      };
    }

    const [
      schedules,
      transfers,
      { settHarvests },
      { badgerTreeDistributions },
    ] = await Promise.all([
      api.loadSchedule(address, true, network),
      this.#loadVaultTransfers(network, address),
      graph.loadSettHarvests({
        where: {
          sett: address.toLowerCase(),
        },
        orderBy: SettHarvest_OrderBy.Timestamp,
        orderDirection: OrderDirection.Desc,
      }),
      graph.loadBadgerTreeDistributions({
        where: {
          sett: address.toLowerCase(),
        },
        orderBy: BadgerTreeDistribution_OrderBy.Timestamp,
        orderDirection: OrderDirection.Desc,
      }),
    ]);

    // some error handling here...
    if (Array.isArray(schedules)) {
      schedules.forEach((s) => (s.token = tokens[s.token].name));
    }

    const timestamps = Array.from(
      new Set(settHarvests.map((s) => s.timestamp)),
    );
    const snapshots = await api.loadVaultSnapshots(
      vault.vaultToken,
      timestamps,
      network,
    );
    const snapshotsByTimestamp = Object.fromEntries(
      snapshots.map((s) => [s.timestamp, s]),
    );

    const harvests: VaultHarvestInfo[] = [];

    for (let i = 0; i < settHarvests.length - 1; i++) {
      const start = settHarvests[i];
      const end = settHarvests[i + 1];
      const duration = start.timestamp - end.timestamp;
      const underlyingDecimals = tokens[vault.underlyingToken].decimals;
      const isDigg =
        start.token.id ===
        '0x798D1bE841a82a273720CE31c822C61a67a601C3'.toLowerCase();
      let tokenAmount = BigNumber.from(start.amount);
      if (isDigg) {
        tokenAmount = tokenAmount.div(
          '222256308823765331027878635805365830922307440079959220679625904457',
        );
      }
      const amount = formatBalance(tokenAmount, underlyingDecimals);
      const value = amount * prices[vault.underlyingToken] ?? 0;

      const vaultSnapshot = snapshotsByTimestamp[start.timestamp];
      let balanceAmount = 0;
      if (!isDigg && vaultSnapshot.strategyBalance) {
        balanceAmount = vaultSnapshot.strategyBalance;
      } else {
        balanceAmount = vaultSnapshot.balance;
      }

      const balanceValue = balanceAmount * prices[vault.underlyingToken];
      const apr = (value / balanceValue) * (31536000 / duration) * 100;
      if (!BLACKLIST_HARVESTS.includes(address)) {
        harvests.push({
          rewardType: RewardType.Harvest,
          token: tokens[vault.underlyingToken].name,
          amount,
          value,
          duration,
          apr,
          timestamp: start.timestamp,
          hash: start.id.split('-')[0],
        });
      }

      badgerTreeDistributions
        .filter((d) => d.timestamp === start.timestamp)
        .forEach((d) => {
          const tokenAddress = d.token.id.startsWith('0x0x')
            ? d.token.id.slice(2)
            : d.token.id;
          const emissionToken = tokens[ethers.utils.getAddress(tokenAddress)];
          if (!emissionToken) {
            // bsc and arb is apparently acting weird
            return;
          }
          let tokenAmount = BigNumber.from(d.amount);
          if (
            d.token.id ===
            '0x798D1bE841a82a273720CE31c822C61a67a601C3'.toLowerCase()
          ) {
            tokenAmount = tokenAmount.div(
              '222256308823765331027878635805365830922307440079959220679625904457',
            );
          }
          const amount = formatBalance(tokenAmount, emissionToken.decimals);
          const value =
            amount * prices[ethers.utils.getAddress(emissionToken.address)] ??
            0;
          const apr = (value / balanceValue) * (31536000 / duration) * 100;
          harvests.push({
            rewardType: RewardType.TreeDistribution,
            token: emissionToken.name,
            amount,
            value,
            duration,
            apr: isNaN(apr) ? 0 : apr,
            timestamp: start.timestamp,
            hash: d.id.split('-')[0],
          });
        });
    }

    const chartKey = `${network}-${vault.vaultToken}-${ChartTimeFrame.Max}`;
    const result = {
      vault,
      chartData: this.chartData[chartKey] ?? [],
      schedules,
      transfers,
      network,
      prices,
      harvests,
    };
    
    return result;
  }
}
