import React from 'react';
import {
  Network,
  VaultDTO,
  VaultSnapshot,
  VaultVersion,
} from '@badger-dao/sdk';
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

interface Props {
  chartData: VaultSnapshot[];
  vault: VaultDTO;
}

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

function VaultChart({ chartData, vault }: Props): JSX.Element {
  const { version } = vault;

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

  return (
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
  );
}

export default VaultChart;
