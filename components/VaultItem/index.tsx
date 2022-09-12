import { VaultDTOV2, VaultVersion } from '@badger-dao/sdk';

interface Props {
  vault: VaultDTOV2;
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
    <div className="bg-deep p-4 shadow-md border-slate border-t hover:bg-slate cursor-pointer grid grid-cols-3 lg:grid-cols-4">
      <span>
        {name} - {protocol}
      </span>
      <span>${value.toLocaleString()}</span>
      <span>{yieldDisplay}</span>
      <div className="hidden lg:block">
        {lastHarvest > 0 ? new Date(lastHarvest).toLocaleString() : 'Unknown'}
      </div>
    </div>
  );
}

export default VaultItem;
