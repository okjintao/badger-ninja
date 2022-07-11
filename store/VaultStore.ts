import { ChartGranularity, formatBalance, Network } from "@badger-dao/sdk";
import { Transfer_OrderBy, OrderDirection, SettHarvest_OrderBy, BadgerTreeDistribution_OrderBy } from "@badger-dao/sdk/lib/graphql/generated/badger";
import { BigNumber, ethers } from "ethers";
import { makeAutoObservable } from "mobx";
import config from "next/config";
import { RewardType } from "../enums/reward-type.enum";
import { VaultHarvestInfo } from "../interfaces/vault-harvest-info.interface";
import { VaultProps } from "../pages/vault/[network]/[address]";
import { RootStore } from "./RootStore";

const BLACKLIST_HARVESTS = [
  '0xfd05D3C7fe2924020620A8bE4961bBaA747e6305',
  '0x53c8e199eb2cb7c01543c137078a038937a68e40',
];

export class VaultStore {
  private cache: Record<string, VaultProps> = {};

  constructor(private store: RootStore) {
    makeAutoObservable(this);
  }

  async loadVaultData(network: Network, address: string): Promise<VaultProps> {
    const key = `${network}-${address}`;
    if (this.cache[key]) {
      return this.cache[key];
    }
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
      }
    }

    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);

    const [chartData, schedules, { transfers }, { settHarvests }, { badgerTreeDistributions }] = await Promise.all([
      api.loadCharts({
        vault: address,
        start: start.toISOString(),
        end: end.toISOString(),
        granularity: ChartGranularity.DAY,
      }),
      api.loadSchedule(address, true),
      graph.loadTransfers({
        where: {
          sett: address.toLowerCase(),
        },
        orderBy: Transfer_OrderBy.Timestamp,
        orderDirection: OrderDirection.Desc,
      }),
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
      })
    ])

    // some error handling here...
    if (Array.isArray(schedules)) {
      schedules.forEach((s) => (s.token = tokens[s.token].name));
    }

    const vaultTransfers = transfers.map((t) => {
      const transferType =
        Number(t.to.id) === 0
          ? 'Withdraw'
          : Number(t.from.id) === 0
          ? 'Deposit'
          : 'Transfer';
      return {
        from: t.from.id,
        to: t.to.id,
        amount: formatBalance(t.amount, tokens[address].decimals),
        date: new Date(t.timestamp * 1000).toLocaleString(),
        transferType,
        hash: t.id.split('-')[0],
      };
    });

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
      const vaultSnapshot = await graph.loadSett({
        id: address.toLowerCase(),
        block: { number: Number(start.blockNumber) },
      });
      let balanceAmount = 0;
      if (!isDigg && vaultSnapshot.sett?.strategy?.balance) {
        balanceAmount = vaultSnapshot.sett?.strategy?.balance;
      } else {
        balanceAmount = vaultSnapshot.sett?.balance;
      }
      const balanceValue =
        formatBalance(balanceAmount, underlyingDecimals) *
        prices[vault.underlyingToken];
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
            amount * prices[ethers.utils.getAddress(emissionToken.address)] ?? 0;
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

    const result = {
      vault,
      chartData,
      schedules,
      transfers: vaultTransfers,
      network,
      prices,
      harvests,
    };
    this.cache[key] = result;
    return result;
  }
}