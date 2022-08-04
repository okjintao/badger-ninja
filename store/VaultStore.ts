import {
  ChartTimeFrame,
  formatBalance,
  gqlGenT,
  Network,
  VaultSnapshot,
} from '@badger-dao/sdk';
import {
  BadgerTreeDistribution_OrderBy,
  OrderDirection,
  SettHarvest_OrderBy,
  TransferFragment,
} from '@badger-dao/sdk/lib/graphql/generated/badger';
import { BigNumber, ethers } from 'ethers';
import { makeAutoObservable } from 'mobx';
import { RewardType } from '../enums/reward-type.enum';
import { defaultProps, VaultProps } from '../pages/vault/[network]/[address]';
import { TransferType } from './enums/transfer-type.enum';
import { VaultTransfer } from './interfaces/vault-transfer.interface';
import { RootStore } from './RootStore';

export class VaultStore {
  private cache: Record<string, VaultProps> = {};
  public chartData: Record<string, VaultSnapshot[]> = {};
  public vaultTransfers: Record<string, VaultTransfer[]> = {};

  constructor(private store: RootStore) {
    makeAutoObservable(this);
  }

  #getVaultChart(
    network: Network,
    vault: string,
    timeframe: ChartTimeFrame,
  ): VaultSnapshot[] {
    const chartKey = `${network}-${vault}-${timeframe}`;
    return this.chartData[chartKey] ?? [];
  }

  async #loadVaultCharts(
    network: Network,
    address: string,
    timeframe: ChartTimeFrame,
  ): Promise<VaultSnapshot[]> {
    const { api } = this.store.sdk;
    await Promise.all(
      Object.values(ChartTimeFrame).map(async (timeframe) => {
        const chartKey = `${this.#getVaultKey(network, address)}-${timeframe}`;
        this.chartData[chartKey] = await api.loadVaultChart(
          address,
          timeframe,
          network,
        );
      }),
    );
    return this.chartData[
      `${this.#getVaultKey(network, address)}-${timeframe}`
    ];
  }

  async #loadVaultTransfers(
    network: Network,
    address: string,
  ): Promise<VaultTransfer[]> {
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
        date: t.timestamp,
        type: transferType,
        hash: t.id.split('-')[0],
      };
    });

    return this.vaultTransfers[transferKey];
  }

  #getVaultKey(network: Network, address: string): string {
    return `${network}-${address}`;
  }

  async loadVaultData(
    network: Network,
    address: string,
    timeframe: ChartTimeFrame,
  ): Promise<VaultProps> {
    const { api } = this.store.sdk;
    const { initialized, networks } = this.store.protocol;
    const { tokens, vaults, prices } = networks[network];

    const vault = vaults.find((v) => v.vaultToken === address);

    if (!vault || !initialized) {
      return defaultProps;
    }

    const key = this.#getVaultKey(network, address);
    if (this.cache[key]) {
      this.cache[key].chartData = this.#getVaultChart(
        network,
        address,
        timeframe,
      );
      return this.cache[key];
    }

    const [schedules, transfers, harvests, chartData] = await Promise.all([
      api.loadSchedule(address, true, network),
      this.#loadVaultTransfers(network, address),
      api.loadVaultHarvests(address, network),
      this.#loadVaultCharts(network, address, timeframe),
    ]);

    // some error handling here...
    if (Array.isArray(schedules)) {
      schedules.forEach((s) => (s.token = tokens[s.token].name));
    }

    const result: VaultProps = {
      vault,
      chartData,
      schedules,
      transfers: transfers.sort((a, b) => b.date - a.date),
      network,
      prices,
      harvests,
    };
    this.cache[key] = result;
    return result;
  }
}
