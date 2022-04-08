import BadgerSDK, {
  BadgerAPI,
  BadgerGraph,
  ChartGranularity,
  Currency,
  EmissionSchedule,
  formatBalance,
  Network,
  PriceSummary,
  VaultDTO,
  VaultHarvestData,
  VaultSnapshot,
  VaultVersion,
} from '@badger-dao/sdk';
import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import VaultStatistic from '../../../components/VaultStatistic';
import {
  Area,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { timeFormat } from 'd3-time-format';
import { format } from 'd3-format';
import {
  BadgerTreeDistribution_OrderBy,
  OrderDirection,
  SettHarvest_OrderBy,
  Transfer_OrderBy,
} from '@badger-dao/sdk/lib/graphql/generated/badger';
import { VaultTransfer } from '../../../interfaces/vault-transfer.interface';
import { getChainExplorer, shortenAddress } from '../../../utils';
import { useState } from 'react';
import { VaultHarvestInfo } from '../../../interfaces/vault-harvest-info.interface';
import { RewardType } from '../../../enums/reward-type.enum';
import { ethers } from 'ethers';
import getStore from '../../../store';

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
  const {
    name,
    value,
    pricePerFullShare,
    vaultAsset,
    asset,
    balance,
    available,
    lastHarvest,
    version,
    protocol,
    underlyingToken,
    vaultToken,
    strategy,
    minApr,
    maxApr,
    apr,
    yieldProjection,
  } = vault;
  const {
    address: strategyAddress,
    performanceFee,
    strategistFee,
    withdrawFee,
    aumFee,
  } = strategy;
  const {
    harvestValue,
    yieldValue,
    yieldTokens,
    harvestTokens,
    yieldApr,
    harvestApr,
  } = yieldProjection;
  const toExplorerLink = (address: string) =>
    `${getChainExplorer(network)}/address/${address}`;
  const toReadableFee = (fee: number) => `${fee / 100}%`;
  const valueFormatter = format('^$.3s');

  function legendFormatter(value: string): string {
    switch (value) {
      case 'value':
        return 'TVL';
      case 'yieldApr':
        return 'Spot APR';
      case 'harvestApr':
        return 'Projected APR';
      default:
        return '21 day APR';
    }
  }

  function tooltipFormatter(value: number, name: string): [string, string] {
    switch (name) {
      case 'value':
        return [valueFormatter(value), 'TVL'];
      case 'yieldApr':
        return [`${value.toFixed(2)}%`, 'Spot'];
      case 'harvestApr':
        return [`${value.toFixed(2)}%`, 'Projected'];
      default:
        return [`${value.toFixed(2)}%`, 'APR'];
    }
  }

  let minYield = Number.MAX_VALUE;
  let maxYield = Number.MIN_VALUE;

  chartData.forEach((d) => {
    if (d.apr < minYield) {
      minYield = d.apr;
    }
    if (d.apr > maxYield) {
      maxYield = d.apr;
    }
    if (version === VaultVersion.v1_5) {
      if (d.yieldApr < minYield) {
        minYield = d.yieldApr;
      }
      if (d.harvestApr < minYield) {
        minYield = d.harvestApr;
      }
      if (d.yieldApr > maxYield) {
        maxYield = d.yieldApr;
      }
      if (d.harvestApr > maxYield) {
        maxYield = d.harvestApr;
      }
    }
  });

  const toAprRange = (apy: number, minApr?: number, maxApr?: number) =>
    minApr && maxApr && minApr !== maxApr
      ? `${minApr.toFixed(2)}% - ${maxApr.toFixed(2)}%`
      : `${apy.toFixed(2)}%`;
  const currentYieldDisplay = toAprRange(apr, minApr, maxApr);

  let yieldDisplay: React.ReactNode;
  if (vault.sourcesApy.length > 0) {
    yieldDisplay = vault.sources.map((s) => (
      <VaultStatistic
        key={s.name}
        title={s.name}
        value={toAprRange(s.apr, s.minApr, s.maxApr)}
      />
    ));
  } else {
    yieldDisplay = (
      <div className="text-sm mt-4 text-gray-300">
        {vault.name} has no recorded yield sources.
      </div>
    );
  }

  const hasEmissionSchedules = schedules.length > 0;
  let emissionDisplay: React.ReactNode;
  if (hasEmissionSchedules) {
    emissionDisplay = schedules.map((s) => {
      const title = `${s.token} (${s.compPercent}% complete)`;
      const start = new Date(s.start * 1000).toLocaleDateString();
      const end = new Date(s.end * 1000).toLocaleDateString();
      return (
        <VaultStatistic
          key={`${s.token}-emission`}
          title={title}
          value={s.amount}
          subtext={`${start} - ${end}`}
        />
      );
    });
  } else {
    emissionDisplay = (
      <div className="text-sm mt-4 text-gray-300">
        {vault.name} has no active emission schedules.
      </div>
    );
  }

  const realizedHarvestPercent =
    version === VaultVersion.v1_5 ? (harvestValue / yieldValue) * 100 : 0;

  const maxHarvestPages = harvests.length / PAGE_SIZE - 1;
  const [harvestPage, setHarvestPage] = useState(0);

  const maxPages = transfers.length / PAGE_SIZE - 1;
  const [page, setPage] = useState(0);

  return (
    <div className="flex flex-grow flex-col w-full md:11/12 lg:w-5/6 xl:w-3/4 text-gray-300 pb-10 mx-auto">
      <div className="bg-calm mt-4 md:mt-8 p-3 md:p-4 rounded-lg mx-2 md:mx-0">
        <div className="text-sm text-gray-400">Vault Information</div>
        <div className="text-3xl font-semibold text-white">
          {name} - ${value.toLocaleString()}
        </div>
        <div className="text-xs text-gray-400">{version}</div>
        <div className="mt-4 mb-2 grid grid-cols-2 lg:grid-cols-4">
          <VaultStatistic title="Protocol" value={protocol} />
          <VaultStatistic
            title="Last Harvest"
            value={new Date(lastHarvest * 1000).toLocaleString()}
          />
          <VaultStatistic
            title={`${asset} per ${vaultAsset}`}
            value={pricePerFullShare}
          />
          <VaultStatistic title="Balance" value={balance} />
          <VaultStatistic title="Available" value={available} />
          <VaultStatistic
            title="Deposit Token"
            value={shortenAddress(underlyingToken)}
            link={toExplorerLink(underlyingToken)}
          />
          <VaultStatistic
            title="Vault Token"
            value={shortenAddress(vaultToken)}
            link={toExplorerLink(vaultToken)}
          />
          <VaultStatistic
            title="Strategy"
            value={shortenAddress(strategyAddress)}
            link={toExplorerLink(strategyAddress)}
          />
          <VaultStatistic
            title="Performance Fee"
            value={toReadableFee(performanceFee)}
          />
          <VaultStatistic
            title="Strategist Fee"
            value={toReadableFee(strategistFee)}
          />
          <VaultStatistic
            title="Withdraw Fee"
            value={toReadableFee(withdrawFee)}
          />
          <VaultStatistic
            title="Management Fee"
            value={toReadableFee(aumFee)}
          />
        </div>
      </div>
      <div className="bg-calm mt-4 p-3 md:p-4 rounded-lg mx-2 md:mx-0">
        <div className="text-sm text-gray-400 mb-4">Vault History</div>
        <ResponsiveContainer height={350}>
          <ComposedChart data={chartData}>
            <Legend formatter={legendFormatter} />
            <Tooltip
              formatter={tooltipFormatter}
              labelFormatter={timeFormat('%B %d, %Y')}
            />
            <XAxis
              dataKey="timestamp"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={timeFormat('%m-%d')}
              tickLine={false}
              axisLine={false}
              style={{ fill: 'white' }}
              tickCount={10}
            />
            <YAxis
              dataKey="value"
              yAxisId="value"
              axisLine={false}
              tickLine={false}
              type="number"
              domain={['auto', 'auto']}
              tickCount={10}
              minTickGap={50}
              tickFormatter={valueFormatter}
              style={{ fill: 'white' }}
            />
            <YAxis
              dataKey="apr"
              yAxisId="yieldApr"
              orientation="right"
              axisLine={false}
              tickLine={false}
              type="number"
              domain={[minYield * 0.95, maxYield * 1.05]}
              tickCount={10}
              minTickGap={50}
              tickFormatter={(v: number) => `${v.toFixed(1)}%`}
              style={{ fill: 'white' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              fill="#707793"
              stroke="#707793"
              yAxisId="value"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="apr"
              fill="#292929"
              stroke="#292929"
              yAxisId="yieldApr"
              strokeWidth={1.5}
            />
            {version === VaultVersion.v1_5 && (
              <>
                <Line
                  type="monotone"
                  dataKey="yieldApr"
                  fill="gray"
                  stroke="gray"
                  yAxisId="yieldApr"
                  strokeWidth={1.5}
                />
                <Line
                  type="monotone"
                  dataKey="harvestApr"
                  fill="#3bba9c"
                  stroke="#3bba9c"
                  yAxisId="yieldApr"
                  strokeWidth={1.5}
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {version === VaultVersion.v1_5 && (
        <div className="bg-calm mt-4 p-3 md:p-4 rounded-lg mx-2 md:mx-0">
          <div className="text-sm text-gray-400">Vault Harvest Health</div>
          <div
            className={`text-xl ${
              realizedHarvestPercent > 100
                ? 'text-electric text-shadow'
                : realizedHarvestPercent > 97
                ? 'text-green-400'
                : realizedHarvestPercent > 94
                ? 'text-orange-400'
                : 'text-red-400'
            }`}
          >
            {realizedHarvestPercent.toFixed(2)}% Realized Yield
          </div>
          <div className="text-xs mt-2">What is Harvest Health?</div>
          <div className="text-xs mt-1 text-gray-400">
            Harvest health is a measure of a strategy performance. Pending yield
            is the current yield being realized by the vault from the protocol
            being farmed. Pending harvest is the current simulated yield being
            realized by the vault when harvested. This measure most accurately
            reflects the current yield the vault is experiencing with respect to
            market conditions and other externalities.
          </div>
          <div className="grid grid-cols-2 mt-3">
            <div className="flex flex-col">
              <div className="text-xs">Pending Yield ({protocol})</div>
              <div className="grid grid-cols-1 md:grid-cols-2 mt-2">
                {yieldTokens.map((t) => (
                  <VaultStatistic
                    key={`yield-${t.address}`}
                    title={t.symbol}
                    value={t.balance.toFixed(5)}
                    subtext={
                      <div className="text-xs text-gray-400">
                        ${t.value.toFixed(2)}
                      </div>
                    }
                  />
                ))}
              </div>
              <div className="text-xs mt-2">
                Total: {yieldValue.toFixed(2)} ({yieldApr.toFixed(2)}% APR)
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-xs">Pending Harvest</div>
              <div className="grid grid-cols-1 md:grid-cols-2 mt-2">
                {harvestTokens.map((t) => (
                  <VaultStatistic
                    key={`harvest-${t.address}`}
                    title={t.symbol}
                    value={t.balance.toFixed(5)}
                    subtext={
                      <div className="text-xs text-gray-400">
                        ${t.value.toFixed(2)}
                      </div>
                    }
                  />
                ))}
              </div>
              <div className="text-xs mt-2">
                Total: {harvestValue.toFixed(2)} ({harvestApr.toFixed(2)}% APR)
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="mt-4 mx-2 md:mx-0 grid grid-cols-1 md:grid-cols-2">
        <div className="bg-calm p-3 md:mr-2 rounded-lg">
          <div className="text-sm text-gray-400">Vault APR Sources</div>
          <div className="text-xs mt-2">What are Vault APR Sources?</div>
          <div className="text-xs mt-1 mb-1 text-gray-400">
            Vault APR Sources are a 21 day TWAY (Time Weighted Average Yield) of
            the vault given fluctations in yield and TVL. This value will almost
            never match the spot yield, and reflects a more long term yield
            history of the vault.
          </div>
          <div className="text-xl font-semibold text-white">
            {currentYieldDisplay}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2">{yieldDisplay}</div>
        </div>
        <div className="bg-calm p-3 md:ml-2 rounded-lg mt-4 md:mt-0">
          <div className="text-sm text-gray-400">Vault Emission Schedules</div>
          <div className="text-xs mt-2">What are Emission Schedules?</div>
          <div className="text-xs mt-1 mb-1 text-gray-400">
            Emission schedules are how Badger distributes rewards to depositors.
            A set number of a specific token is distributed to the vault over
            any given duration. These tokens are distributed either pro rata or
            in a boosted manner dependent on the token emitted.
          </div>
          <div className="text-xl font-semibold text-white">
            {schedules.length} Active Schedules
          </div>
          <div
            className={`grid grid-cols-1 ${
              hasEmissionSchedules ? 'md:grid-cols-2' : ''
            }`}
          >
            {emissionDisplay}
          </div>
        </div>
      </div>
      <div className="bg-calm mt-4 p-3 md:p-4 rounded-lg mx-2 md:mx-0">
        <div className="text-sm text-gray-400">Vault Harvest History</div>
        <div className="mt-2">
          <div className="md:grid hidden md:grid-cols-6 p-1">
            <div>Date</div>
            <div>Reward Type</div>
            <div>Value</div>
            <div>Amount</div>
            <div>APR</div>
            <div>Transaction</div>
          </div>
          {harvests
            .slice(harvestPage * PAGE_SIZE, harvestPage + 1 * PAGE_SIZE + 1)
            .map((h, i) => {
              return (
                <div
                  key={`harvest-${h.token}-${i}`}
                  className="grid grid-cols-1 md:grid-cols-6 py-1"
                >
                  <div>{new Date(h.timestamp * 1000).toLocaleString()}</div>
                  <div>{h.rewardType}</div>
                  <div>{formatter.format(h.value)}</div>
                  <div>
                    {h.amount.toFixed(3)} {h.token}
                  </div>
                  <div>{h.apr.toFixed(2)}%</div>
                  <div className="text-mint">
                    <a
                      className="flex"
                      href={`${getChainExplorer(network)}/tx/${h.hash}`}
                      target="_blank"
                    >
                      {shortenAddress(h.hash, 8)}
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
              );
            })}
          <div className="flex my-2 justify-center items-center">
            <svg
              onClick={() => {
                if (harvestPage > 0) {
                  setHarvestPage(harvestPage - 1);
                }
              }}
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 ${
                harvestPage > 0
                  ? 'hover:text-mint cursor-pointer'
                  : 'opacity-50'
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
              {harvestPage + 1}
            </div>
            <svg
              onClick={() => {
                if (harvestPage + 1 < maxHarvestPages) {
                  setHarvestPage(harvestPage + 1);
                }
              }}
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 ${
                harvestPage < maxHarvestPages
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
      <div className="bg-calm mt-4 p-3 md:p-4 rounded-lg mx-2 md:mx-0">
        <div className="text-sm text-gray-400">Vault User History</div>
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

export async function getStaticProps({
  params,
}: GetStaticPropsContext<VaultPathParms>): Promise<
  GetStaticPropsResult<Props>
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
    const amount = formatBalance(start.amount, underlyingDecimals);
    const value = amount * prices[vault.underlyingToken] ?? 0;
    const vaultSnapshot = await graph.loadSett({
      id: address.toLowerCase(),
      block: { number: Number(start.blockNumber) },
    });
    const balance =
      vaultSnapshot.sett?.strategy?.balance ?? vaultSnapshot.sett?.balance;
    const balanceValue =
      formatBalance(balance, underlyingDecimals) *
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
        const amount = formatBalance(d.amount, emissionToken.decimals);
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

export async function getStaticPaths(): Promise<
  GetStaticPathsResult<VaultPathParms>
> {
  const { protocol } = getStore();
  await protocol.loadProtocolData();

  let paths: { params: VaultPathParms }[] = [];

  for (const network of Object.values(protocol.networks)) {
    const pathParams = network.vaults.map((v) => ({
      params: { address: v.vaultToken, network: network.network },
    }));
    paths = paths.concat(pathParams);
  }

  return {
    paths,
    fallback: false,
  };
}

export default VaultInformation;
