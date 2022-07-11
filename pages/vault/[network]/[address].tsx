import BadgerSDK, {
  ChartGranularity,
  EmissionSchedule,
  formatBalance,
  Network,
  PriceSummary,
  VaultDTO,
  VaultSnapshot,
  VaultVersion,
} from '@badger-dao/sdk';
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import VaultStatistic from '../../../components/VaultStatistic';
import {
  BadgerTreeDistribution_OrderBy,
  OrderDirection,
  SettHarvest_OrderBy,
  Transfer_OrderBy,
} from '@badger-dao/sdk/lib/graphql/generated/badger';
import { VaultTransfer } from '../../../interfaces/vault-transfer.interface';
import { getChainExplorer, shortenAddress } from '../../../utils';
import React, { useState } from 'react';
import { VaultHarvestInfo } from '../../../interfaces/vault-harvest-info.interface';
import { RewardType } from '../../../enums/reward-type.enum';
import { ethers } from 'ethers';
import getStore from '../../../store';
import VaultSummary from '../../../components/VaultSummary';
import VaultChart from '../../../components/VaultChart';
import { BigNumber } from '@badger-dao/sdk/node_modules/ethers';
import VaultAprSources from '../../../components/VaultAprSources';
import VaultSchedules from '../../../components/VaultSchedules';
import VaultHarvestHealth from '../../../components/VaultHarvestHealth';
import VaultHarvestHistory from '../../../components/VaultHarvestHistory';

interface Props {
  vault: VaultDTO;
  chartData: VaultSnapshot[];
  schedules: EmissionSchedule[];
  transfers: VaultTransfer[];
  network: Network;
  prices: PriceSummary;
  harvests: VaultHarvestInfo[];
}

type VaultPathParms = { network: string; address: string };

const PAGE_SIZE = 10;

const BLACKLIST_HARVESTS = [
  '0xfd05D3C7fe2924020620A8bE4961bBaA747e6305',
  '0x53c8e199eb2cb7c01543c137078a038937a68e40',
];

function VaultInformation({
  vault,
  chartData,
  schedules,
  transfers,
  network,
  prices,
  harvests,
}: Props): JSX.Element {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  const { version } = vault;

  const maxPages = transfers.length / PAGE_SIZE - 1;
  const [page, setPage] = useState(0);

  return (
    <div className="flex flex-grow flex-col w-full md:11/12 lg:w-5/6 xl:w-3/4 text-gray-300 pb-10 mx-auto">
      <VaultSummary network={network} vault={vault} />
      <VaultChart chartData={chartData} vault={vault} />
      {version === VaultVersion.v1_5 && <VaultHarvestHealth vault={vault} />}
      <div className="mt-4 mx-2 lg:mx-0 grid grid-cols-1 md:grid-cols-2">
        <VaultAprSources vault={vault} />
        <VaultSchedules vault={vault} schedules={schedules} />
      </div>
      <VaultHarvestHistory network={network} harvests={harvests} />
      <div className="bg-card mt-4 p-3 md:p-4 rounded-lg mx-2 lg:mx-0">
        <div className="text-xs text-gray-400">Vault User History</div>
        <div className="mt-2">
          <div className="md:grid hidden md:grid-cols-4 p-1">
            <div>Date</div>
            <div>Action</div>
            <div>Amount</div>
            <div>Transaction</div>
          </div>
          {transfers
            .slice(PAGE_SIZE * page, PAGE_SIZE * (page + 1) + 1)
            .map((t, i) => {
              return (
                <div key={`${t.hash}-${i}`} className="grid grid-cols-1">
                  <div className="grid md:grid-cols-4 p-1 rounded-lg">
                    <div>{t.date}</div>
                    <div>{t.transferType}</div>
                    <div>
                      {t.amount.toLocaleString()} (
                      {formatter.format(prices[vault.vaultToken] * t.amount)})
                    </div>
                    <div className="text-mint">
                      <a
                        className="flex"
                        href={`${getChainExplorer(network)}/tx/${t.hash}`}
                        target="_blank"
                      >
                        {shortenAddress(t.hash, 8)}
                        <svg
                          className="ml-2 mt-1"
                          fill="#3bba9c"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="15px"
                          height="15px"
                        >
                          <path d="M 5 3 C 3.9069372 3 3 3.9069372 3 5 L 3 19 C 3 20.093063 3.9069372 21 5 21 L 19 21 C 20.093063 21 21 20.093063 21 19 L 21 12 L 19 12 L 19 19 L 5 19 L 5 5 L 12 5 L 12 3 L 5 3 z M 14 3 L 14 5 L 17.585938 5 L 8.2929688 14.292969 L 9.7070312 15.707031 L 19 6.4140625 L 19 10 L 21 10 L 21 3 L 14 3 z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          <div className="flex my-2 justify-center items-center">
            <svg
              onClick={() => {
                if (page > 0) {
                  setPage(page - 1);
                }
              }}
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 ${
                page > 0 ? 'hover:text-mint cursor-pointer' : 'opacity-50'
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <div className="font-semibold font-gray-400 text-sm mx-2">
              {page + 1}
            </div>
            <svg
              onClick={() => {
                if (page < maxPages) {
                  setPage(page + 1);
                }
              }}
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 ${
                page < maxPages
                  ? 'hover:text-mint cursor-pointer'
                  : 'opacity-50'
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

// TODO: FIX THIS!
export async function getServerSideProps({
  params,
}: GetServerSidePropsContext<VaultPathParms>): Promise<
  GetServerSidePropsResult<Props>
> {
  if (!params) {
    throw new Error('Building page with no params!');
  }

  const { network, address } = params;
  const sdk = new BadgerSDK({
    network,
    provider: '',
  });
  const { api, graph, config } = sdk;
  const tokens = await api.loadTokens();
  const vault = await api.loadVault(address);

  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  const chartData = await api.loadCharts({
    vault: address,
    start: start.toISOString(),
    end: end.toISOString(),
    granularity: ChartGranularity.DAY,
  });
  const schedules = await api.loadSchedule(address, true);
  schedules.forEach((s) => (s.token = tokens[s.token].name));

  const { transfers } = await graph.loadTransfers({
    where: {
      sett: address.toLowerCase(),
    },
    orderBy: Transfer_OrderBy.Timestamp,
    orderDirection: OrderDirection.Desc,
  });
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

  const prices = await api.loadPrices();

  const { settHarvests } = await graph.loadSettHarvests({
    where: {
      sett: address.toLowerCase(),
    },
    orderBy: SettHarvest_OrderBy.Timestamp,
    orderDirection: OrderDirection.Desc,
  });
  const { badgerTreeDistributions } = await graph.loadBadgerTreeDistributions({
    where: {
      sett: address.toLowerCase(),
    },
    orderBy: BadgerTreeDistribution_OrderBy.Timestamp,
    orderDirection: OrderDirection.Desc,
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

  return {
    props: {
      vault,
      chartData,
      schedules,
      transfers: vaultTransfers,
      network: config.network,
      prices,
      harvests,
    },
  };
}

export default VaultInformation;
