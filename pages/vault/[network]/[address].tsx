import {
  BadgerAPI,
  BadgerGraph,
  ChartGranularity,
  Currency,
  EmissionSchedule,
  formatBalance,
  Network,
  VaultDTO,
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
  OrderDirection,
  Transfer_OrderBy,
} from '@badger-dao/sdk/lib/graphql/generated/badger';
import { VaultTransfer } from '../../../interfaces/vault-transfer.interface';

interface Props {
  vault: VaultDTO;
  chartData: VaultSnapshot[];
  schedules: EmissionSchedule[];
  transfers: VaultTransfer[];
}

type VaultPathParms = { network: string; address: string };

function VaultInformation({
  vault,
  chartData,
  schedules,
  transfers,
}: Props): JSX.Element {
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
    minApy,
    maxApy,
    apy,
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
  const shortenAddress = (address: string) =>
    address
      .slice(0, 4)
      .concat('...')
      .concat(address.slice(address.length - 4));
  const toExplorerLink = (address: string) =>
    `https://etherscan.io/address/${address}`;
  const toReadableFee = (fee: number) => `${fee / 100}%`;
  const valueFormatter = format('^$.3s');

  function legendFormatter(value: string): string {
    switch (value) {
      case 'value':
        return 'TVL';
      case 'yieldApr':
        return 'Spot';
      case 'harvestApr':
        return 'Projected';
      default:
        return 'APR';
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

  const toAprRange = (apy: number, minApy?: number, maxApy?: number) =>
    minApy && maxApy && minApy !== maxApy
      ? `${minApy.toFixed(2)}% - ${maxApy.toFixed(2)}%`
      : `${apy.toFixed(2)}%`;
  const currentYieldDisplay = toAprRange(apy, minApy, maxApy);

  let yieldDisplay: React.ReactNode;
  if (vault.sourcesApy.length > 0) {
    yieldDisplay = vault.sourcesApy.map((s) => (
      <VaultStatistic
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

  let emissionDisplay: React.ReactNode;
  if (schedules.length > 0) {
    emissionDisplay = schedules.map((s) => {
      const title = `${s.token} (${s.compPercent}% complete)`;
      const start = new Date(s.start * 1000).toLocaleDateString();
      const end = new Date(s.end * 1000).toLocaleDateString();
      return (
        <VaultStatistic
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
    version === VaultVersion.v1_5
      ? Math.min(harvestValue / yieldValue, 1) * 100
      : 0;

  return (
    <div className="flex flex-grow flex-col w-full md:w-5/6 text-gray-300 pb-10 mx-auto">
      <div className="bg-calm mt-4 md:mt-8 p-3 md:p-4 rounded-lg mx-2 md:mx-0">
        <div className="text-sm text-gray-400">Vault Information</div>
        <div className="text-3xl font-semibold text-white">
          {name} - ${value.toLocaleString()}
        </div>
        <div className="text-xs text-gray-400">{version}</div>
        <div className="mt-4 mb-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
        <div className="text-sm text-gray-400">Vault History</div>
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
            />
            <Line
              type="monotone"
              dataKey="apr"
              fill="#292929"
              stroke="#292929"
              yAxisId="yieldApr"
            />
            {version === VaultVersion.v1_5 && (
              <>
                <Line
                  type="monotone"
                  dataKey="harvestApr"
                  fill="#3bba9c"
                  stroke="#3bba9c"
                  yAxisId="yieldApr"
                />
                <Line
                  type="monotone"
                  dataKey="yieldApr"
                  fill="#2e3047"
                  stroke="#2e3047"
                  yAxisId="yieldApr"
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 mx-2 md:mx-0 grid grid-cols-1 md:grid-cols-2">
        <div className="bg-calm p-3 md:mr-2 rounded-lg">
          <div className="text-sm text-gray-400">Vault APR Sources</div>
          <div className="text-xl font-semibold text-white">
            {currentYieldDisplay}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2">{yieldDisplay}</div>
        </div>
        <div className="bg-calm p-3 md:ml-2 rounded-lg mt-4 md:mt-0">
          <div className="text-sm text-gray-400">Vault Emissions</div>
          <div className="text-xl font-semibold text-white">
            {schedules.length} Active Schedules
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2">
            {emissionDisplay}
          </div>
        </div>
      </div>
      {version === VaultVersion.v1_5 && (
        <div className="bg-calm mt-4 p-3 md:p-4 rounded-lg mx-2 md:mx-0">
          <div className="text-sm text-gray-400">Vault Harvest Health</div>
          <div
            className={`text-xl ${
              realizedHarvestPercent > 95
                ? 'text-green-400'
                : realizedHarvestPercent > 90
                ? 'text-orange-400'
                : 'text-red-400'
            }`}
          >
            {realizedHarvestPercent.toFixed(2)}% Realized Yield
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 mt-3">
            <div className="flex flex-col">
              <div className="text-xs text-gray-400">
                Pending Yield ({protocol})
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 mt-2">
                {yieldTokens.map((t) => (
                  <VaultStatistic
                    key={`yield-${t.address}`}
                    title={t.symbol}
                    value={t.balance}
                    subtext={
                      <div className="text-xs text-gray-400">
                        ${t.value.toFixed(2)}
                      </div>
                    }
                  />
                ))}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Total: {yieldValue.toFixed(2)} ({yieldApr.toFixed(2)}% APR)
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-xs text-gray-400">Pending Harvest</div>
              <div className="grid grid-cols-1 md:grid-cols-2 mt-2">
                {harvestTokens.map((t) => (
                  <VaultStatistic
                    key={`harvest-${t.address}`}
                    title={t.symbol}
                    value={t.balance}
                    subtext={
                      <div className="text-xs text-gray-400">
                        ${t.value.toFixed(2)}
                      </div>
                    }
                  />
                ))}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Total: {harvestValue.toFixed(2)} ({harvestApr.toFixed(2)}% APR)
              </div>
            </div>
          </div>
        </div>
      )}
      {/* <div className="bg-calm mt-4 p-3 md:p-4 rounded-lg mx-2 md:mx-0">
        <div className="text-sm text-gray-400">Vault Harvest History</div>
      </div> */}
      <div className="bg-calm mt-4 p-3 md:p-4 rounded-lg mx-2 md:mx-0">
        <div className="text-sm text-gray-400">Vault User History</div>
        <div className="mt-2 mx-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 p-1">
            <span>Date</span>
            <span>Action</span>
            <span>Amount</span>
            <span>Transaction</span>
          </div>
          {transfers.map((t, i) => {
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 p-2 rounded-lg">
                <span>{t.date}</span>
                <span>{t.transferType}</span>
                <span>{t.amount.toFixed(5)}</span>
                <span className="text-mint">
                  <a href={`https://etherscan.io/tx/${t.hash}`} target="_blank">
                    View
                  </a>
                </span>
              </div>
            );
          })}
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
  const api = new BadgerAPI({ network });
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

  const graph = new BadgerGraph({ network });
  const { transfers } = await graph.loadTransfers({
    where: {
      sett: address.toLowerCase(),
    },
    orderBy: Transfer_OrderBy.Timestamp,
    orderDirection: OrderDirection.Desc,
    first: 25,
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

  return {
    props: {
      vault,
      chartData,
      schedules,
      transfers: vaultTransfers,
    },
  };
}

export async function getStaticPaths(): Promise<
  GetStaticPathsResult<VaultPathParms>
> {
  const api = new BadgerAPI({ network: 1 });

  let paths: { params: VaultPathParms }[] = [];

  for (const network of Object.entries(Network)) {
    try {
      const [_key, value] = network;
      const networkVaults = await api.loadVaults(Currency.USD, value);
      const pathParams = networkVaults.map((v) => ({
        params: { address: v.vaultToken, network: value },
      }));
      paths = paths.concat(pathParams);
    } catch {} // some network are not supported
  }

  return {
    paths,
    fallback: false,
  };
}

export default VaultInformation;
