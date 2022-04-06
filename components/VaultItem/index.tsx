import { VaultDTO, VaultVersion } from '@badger-dao/sdk';

interface Props {
  vault: VaultDTO;
}

function VaultItem({ vault }: Props): JSX.Element {
  const {
    name,
    value,
    apr,
    minApr,
    maxApr,
    yieldProjection: { harvestApr },
    protocol,
    lastHarvest,
    version,
    sources,
  } = vault;

  let minYield = minApr ?? apr;
  let maxYield = maxApr ?? apr;

  if (version === VaultVersion.v1_5) {
    const boostedSources = sources.filter((s) => s.boostable);
    const boostedMinApr = boostedSources.reduce(
      (total, s) => total + s.minApr,
      0,
    );
    const boostedMaxApr = boostedSources.reduce(
      (total, s) => total + s.maxApr,
      0,
    );
    minYield = harvestApr + boostedMinApr;
    maxYield = harvestApr + boostedMaxApr;
  }

  const hasYieldRange = minYield < maxYield;
  const yieldDisplay = `${minYield.toFixed(2)}%${
    hasYieldRange ? ` - ${maxYield.toFixed(2)}%` : ''
  }`;
  return (
    <div className="flex flex-col bg-calm rounded-lg m-2 p-4 shadow-md hover:bg-foam cursor-pointer">
      <div className="flex justify-between items-end">
        <div className="text-lg">{name}</div>
        <div className="text-sm">{protocol}</div>
      </div>
      <div className="flex justify-between">
        <div className="text-sm">${value.toLocaleString()}</div>
        <div className="text-sm">{yieldDisplay}</div>
      </div>
      <div className="text-xs text-gray-400">
        Harvested:{' '}
        {lastHarvest > 0
          ? new Date(lastHarvest * 1000).toLocaleString()
          : 'Unkown'}
      </div>
    </div>
  );
}

export default VaultItem;
