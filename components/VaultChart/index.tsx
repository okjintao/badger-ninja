import {
  ChartTimeFrame,
  VaultDTO,
  VaultSnapshot,
  VaultVersion,
} from '@badger-dao/sdk';
import { format } from 'd3-format';
import { timeFormat } from 'd3-time-format';
import React, { useState } from 'react';
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

import { ChartValueType } from '../../store/enums/chart-value-type.enum';

interface Props {
  chartData: VaultSnapshot[];
  vault: VaultDTO;
  timeframe: ChartTimeFrame;
  setTimeframe: (timeframe: ChartTimeFrame) => void;
}

const valueFormatter = format('^$.3s');
const balanceFormatter = format('^.3s');

function legendFormatter(value: string): string {
  switch (value) {
    case 'value':
      return 'TVL';
    case 'balance':
      return 'Vault Balance';
    case 'yieldApr':
      return 'Spot APR';
    case 'harvestApr':
      return 'Projected APR';
    default:
      return '21 day APR';
  }
}

function getTimeFormatter(timeframe: ChartTimeFrame) {
  switch (timeframe) {
    case ChartTimeFrame.Day:
      return timeFormat('%I %p');
    case ChartTimeFrame.Week:
      return timeFormat('%a %d');
    case ChartTimeFrame.Month:
    case ChartTimeFrame.ThreeMonth:
    case ChartTimeFrame.Year:
    case ChartTimeFrame.YTD:
      return timeFormat('%b %d');
    default:
      return timeFormat('%B');
  }
}

function tooltipFormatter(value: number, name: string): [string, string] {
  switch (name) {
    case 'value':
      return [valueFormatter(value), 'TVL'];
    case 'balance':
      return [balanceFormatter(value), 'Vault Balance'];
    case 'yieldApr':
      return [`${value.toFixed(2)}%`, 'Spot'];
    case 'harvestApr':
      return [`${value.toFixed(2)}%`, 'Projected'];
    default:
      return [`${value.toFixed(2)}%`, 'APR'];
  }
}

function VaultChart({
  chartData,
  vault,
  timeframe,
  setTimeframe,
}: Props): JSX.Element {
  const [valueType, setValueType] = useState(ChartValueType.USD);

  if (chartData.length === 0) {
    return (
      <div className="bg-card mt-4 p-3 md:p-4 rounded-lg mx-2 lg:mx-0">
        <div className="text-xs text-gray-400 mb-4">Vault History</div>
        <ResponsiveContainer height={350}>
          <div className="flex flex-grow w-full h-full animate-pulse bg-slate" />
        </ResponsiveContainer>
      </div>
    );
  }

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
    <div className="mt-10">
      <div className="text-sm mb-4">Vault History</div>
      <div className="bg-card px-3 md:px-4 rounded-lg mx-2 py-6 lg:mx-0">
        <div className="flex justify-between">
          <div className="flex rounded-lg bg-cave p-2 mb-4">
            {Object.values(ChartValueType).map((t, i) => {
              const isActive = valueType === t;
              return (
                <div
                  key={t}
                  onClick={() => setValueType(t)}
                  className={`mx-1 cursor-pointer px-1 ${
                    isActive ? 'bg-badger text-cave rounded-md ' : ''
                  }${i === 0 ? 'ml-2' : 'mr-2'}`}
                >
                  {t}
                </div>
              );
            })}
          </div>
          <div className="flex rounded-lg bg-cave p-2 mb-4">
            {Object.values(ChartTimeFrame).map((t, i) => {
              const isActive = timeframe === t;
              return (
                <div
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`cursor-pointer px-1 ${
                    isActive ? 'bg-badger text-cave rounded-md ' : ''
                  }${
                    i === 0
                      ? 'ml-2'
                      : i === Object.values(ChartTimeFrame).length - 1
                      ? 'mr-2'
                      : 'mx-1'
                  }`}
                >
                  {t}
                </div>
              );
            })}
          </div>
        </div>
        <ResponsiveContainer height={350}>
          <ComposedChart data={chartData}>
            <Legend formatter={legendFormatter} />
            <Tooltip
              formatter={tooltipFormatter}
              labelFormatter={getTimeFormatter(timeframe)}
              contentStyle={{
                background: '#262626',
                borderRadius: '10px',
                color: 'rgba(255, 255, 255, 0.6)',
              }}
            />
            <XAxis
              dataKey="timestamp"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={getTimeFormatter(timeframe)}
              style={{ fill: 'white' }}
              tickCount={10}
            />
            {valueType === ChartValueType.USD && (
              <YAxis
                dataKey="value"
                yAxisId="value"
                type="number"
                domain={['auto', 'auto']}
                tickCount={10}
                minTickGap={50}
                tickFormatter={valueFormatter}
                style={{ fill: 'white' }}
              />
            )}
            {valueType === ChartValueType.Balance && (
              <YAxis
                dataKey="balance"
                yAxisId="balance"
                type="number"
                domain={['auto', 'auto']}
                tickCount={10}
                minTickGap={50}
                tickFormatter={balanceFormatter}
                style={{ fill: 'white' }}
              />
            )}
            <YAxis
              dataKey="apr"
              yAxisId="yieldApr"
              orientation="right"
              type="number"
              domain={[minYield * 0.95, maxYield * 1.05]}
              tickCount={10}
              minTickGap={50}
              tickFormatter={(v: number) => `${v.toFixed(1)}%`}
              style={{ fill: 'white' }}
            />
            {valueType === ChartValueType.USD && (
              <Area
                type="monotone"
                dataKey="value"
                fill="rgba(29, 114, 255, 0.1)"
                stroke="#1D72FF"
                yAxisId="value"
                strokeWidth={2}
              />
            )}
            {valueType === ChartValueType.Balance && (
              <Area
                type="monotone"
                dataKey="balance"
                fill="rgba(29, 114, 255, 0.1)"
                stroke="#1D72FF"
                yAxisId="balance"
                strokeWidth={2}
              />
            )}
            <Line
              type="monotone"
              dataKey="apr"
              fill="#E2652B"
              stroke="#E2652B"
              yAxisId="yieldApr"
              strokeWidth={1.5}
              dot={false}
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
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="harvestApr"
                  fill="#3bba9c"
                  stroke="#3bba9c"
                  yAxisId="yieldApr"
                  strokeWidth={1.5}
                  dot={false}
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default VaultChart;
