import Link from 'next/link';
import React from 'react';

import { VaultHarvestSummary } from '../../interfaces/vault-harvest-summary.interface';

interface Props {
  harvestInformation: VaultHarvestSummary;
}

function VaultHarvestItem({ harvestInformation }: Props): JSX.Element {
  const { name, networkName, yieldProjection, network, address } =
    harvestInformation;
  const { harvestValue, yieldValue } = yieldProjection;
  const realizedHarvestPercent = (harvestValue / yieldValue) * 100;
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  const href = `/vault/${network}/${address}`;
  return (
    <div className="my-1 w-full lg:w-10/12">
      <Link href={href} passHref>
        <a>
        <div className="flex bg-card rounded-lg p-1 lg:p-3 cursor-pointer mx-2">
          <div className="flex flex-col items-center justify-center w-16 md:w-24 m-2">
            <div
              className={`w-2 h-2 rounded-full ${
                realizedHarvestPercent > 100
                  ? 'bg-electric'
                  : realizedHarvestPercent > 97.5
                  ? 'bg-green-400'
                  : realizedHarvestPercent > 95
                  ? 'bg-orange-400'
                  : 'bg-red-400'
              }`}
            />
            <div className="text-xs text-gray-400">{`${
              realizedHarvestPercent > 100
                ? 'Excellent'
                : realizedHarvestPercent > 97.5
                ? 'Good'
                : realizedHarvestPercent > 95
                ? 'Watch'
                : 'Investigate'
            }`}</div>
          </div>
          <div className="flex flex-grow w-full">
            <div className="grid grid-cols-2 md:grid-cols-4 w-full">
              <div className="flex flex-col">
                <div className="text-lg">{name}</div>
                <div className="text-xs text-gray-400">{networkName}</div>
              </div>
              <div className="flex flex-col">
                <div className="text-lg">
                  {realizedHarvestPercent.toFixed(2)}%
                </div>
                <div className="text-xs text-gray-400">
                  Realized Harvest Value
                </div>
              </div>
              <div className="flex flex-col">
                <div className="text-lg">{formatter.format(yieldValue)}</div>
                <div className="text-xs text-gray-400">Yield Value</div>
              </div>
              <div className="flex flex-col">
                <div className="text-lg">{formatter.format(harvestValue)}</div>
                <div className="text-xs text-gray-400">Harvest Value</div>
              </div>
            </div>
          </div>
        </div>
        </a>
      </Link>
    </div>
  );
}

export default VaultHarvestItem;
