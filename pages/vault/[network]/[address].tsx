import { BadgerAPI, ChartGranularity, Currency, Network, VaultDTO, VaultSnapshot } from "@badger-dao/sdk";
import { GetStaticPathsResult, GetStaticPropsContext, GetStaticPropsResult } from "next";
import VaultStatistic from "../../../components/VaultStatistic";
import { Area, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { timeFormat } from 'd3-time-format';
import { format } from 'd3-format';

interface Props {
  vault: VaultDTO;
  chartData: VaultSnapshot[];
}

type VaultPathParms = { network: string, address: string };

function VaultInformation({ vault, chartData }: Props): JSX.Element {
  const { name, value, pricePerFullShare, vaultAsset, asset, balance, available, lastHarvest, version, protocol, underlyingToken, vaultToken, strategy } = vault;
  const { address: strategyAddress, performanceFee, strategistFee, withdrawFee } = strategy;
  const shortenAddress = (address: string) => address.slice(0, 4).concat('...').concat(address.slice(address.length - 4));
  const toExplorerLink = (address: string) => `https://etherscan.io/address/${address}`;
  const toReadableFee = (fee: number) => `${fee / 100}%`;
  const valueFormatter = format('^$.3s');

  function legendFormatter(value: string): string {
    switch(value) {
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
    switch(name) {
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

  return (
    <div className="flex flex-grow flex-col w-full md:w-5/6 text-gray-300 pb-10 mx-auto">
      <div className="bg-calm mt-4 md:mt-8 p-3 md:p-4 rounded-lg mx-2 md:mx-0">
        <div className="text-sm text-gray-400">Vault Information</div>
        <div className="text-3xl font-semibold text-white">{name} - ${value.toLocaleString()}</div>
        <div className="mt-4 mb-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <VaultStatistic title="Version" value={version} />
          <VaultStatistic title="Last Harvest" value={new Date(lastHarvest * 1000).toLocaleString()} />
          <VaultStatistic title="Protocol" value={protocol} />
          <VaultStatistic title={`${asset} per ${vaultAsset}`} value={pricePerFullShare} />
          <VaultStatistic title="Balance" value={balance} />
          <VaultStatistic title="Available" value={available} />
          <VaultStatistic title="Deposit Token" value={shortenAddress(underlyingToken)} link={toExplorerLink(underlyingToken)} />
          <VaultStatistic title="Vault Token" value={shortenAddress(vaultToken)} link={toExplorerLink(vaultToken)} />
          <VaultStatistic title="Strategy" value={shortenAddress(strategyAddress)} link={toExplorerLink(strategyAddress)} />
          <VaultStatistic title="Performance Fee" value={toReadableFee(performanceFee)} />
          <VaultStatistic title="Strategist Fee" value={toReadableFee(strategistFee)} />
          <VaultStatistic title="Withdraw Fee" value={toReadableFee(withdrawFee)} />
        </div>
      </div>
      <div className="bg-calm mt-4 p-3 md:p-4 rounded-lg mx-2 md:mx-0">
        <ResponsiveContainer height={350}>
          <ComposedChart data={chartData}>
            <Legend formatter={legendFormatter}/>
            <Tooltip formatter={tooltipFormatter} labelFormatter={timeFormat('%B %d, %Y')}/>
            <XAxis dataKey="timestamp" type="number" domain={['dataMin', 'dataMax']} tickFormatter={timeFormat('%m-%d')} tickLine={false} axisLine={false} style={{ fill: 'white' }} tickCount={10} />
            <YAxis dataKey="value" yAxisId="value" axisLine={false} tickLine={false} type="number" domain={['auto', 'auto']} tickCount={10} minTickGap={50} tickFormatter={valueFormatter} style={{ fill: 'white' }} />
            <YAxis dataKey="apr" yAxisId="apr" orientation="right" axisLine={false} tickLine={false} type="number" domain={['auto', 'auto']} tickCount={10} minTickGap={50} tickFormatter={(v: number) => `${v.toFixed(1)}%`} style={{ fill: 'white' }} />
            <Area type="monotone" dataKey="value" fill="#707793" stroke="#707793" yAxisId="value" />
            <Line type="monotone" dataKey="apr" fill="#292929" stroke="#292929"  yAxisId="apr" />
            <Line type="monotone" dataKey="harvestApr" fill="#3bba9c" stroke="#3bba9c"  yAxisId="apr" />
            <Line type="monotone" dataKey="yieldApr" fill="#2e3047" stroke="#2e3047"  yAxisId="apr" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


export async function getStaticProps({ params }: GetStaticPropsContext<VaultPathParms>): Promise<GetStaticPropsResult<Props>> {
  if (!params) {
    throw new Error('Building page with no params!');
  }

  const { network, address } = params;
  const api = new BadgerAPI({ network });
  const vault = await api.loadVault(address);

  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  const chartData = await api.loadCharts({ vault: address, start: start.toISOString(), end: end.toISOString(), granularity: ChartGranularity.DAY });

  return {
    props: {
      vault,
      chartData,
    }
  };
}

export async function getStaticPaths(): Promise<GetStaticPathsResult<VaultPathParms>> {
  const api = new BadgerAPI({ network: 1 });

  let paths: { params: VaultPathParms }[] = [];

  for (const network of Object.entries(Network)) {
    try {
      const [_key, value] = network;
      const networkVaults = await api.loadVaults(Currency.USD, value);
      const pathParams = networkVaults.map((v) => ({ params: { address: v.vaultToken, network: value } }));
      paths = paths.concat(pathParams);
    } catch {} // some network are not supported
  }

  return {
    paths,
    fallback: false,
  }
}

export default VaultInformation;
