import { VaultHarvestSummary } from '../../interfaces/vault-harvest-summary.interface';

interface Props {
  harvestInformation: VaultHarvestSummary;
}

function VaultHarvestItem({ harvestInformation }: Props): JSX.Element {
  const { name, networkName, yieldProjection } = harvestInformation;
  const { harvestValue, yieldValue } = yieldProjection;
  const realizedHarvestPercent = (harvestValue / yieldValue) * 100;
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  return (
    <div className="my-1 bg-calm rounded-lg grid grid-cols-2 md:grid-cols-4 p-3 w-full md:w-3/4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col w-full h-full items-center justify-between">
          <div className='flex flex-grow items-center'>
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
          </div>
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
        <div className="flex flex-col">
          <div className="text-lg">{name}</div>
          <div className="text-xs text-gray-400">{networkName}</div>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <div className="text-lg">{formatter.format(yieldValue)}</div>
        <div className="text-xs text-gray-400">Yield Value</div>
      </div>
      <div className="flex flex-col items-center">
        <div className="text-lg">{formatter.format(harvestValue)}</div>
        <div className="text-xs text-gray-400">Harvest Value</div>
      </div>
      <div className="flex flex-col items-center">
        <div className="text-lg">{realizedHarvestPercent.toFixed(2)}%</div>
        <div className="text-xs text-gray-400">Realized Harvest Value</div>
      </div>
    </div>
  );
}

export default VaultHarvestItem;
