import { VaultDTOV3, VaultVersion } from '@badger-dao/sdk';

interface Props {
  vault: VaultDTOV3;
}

function VaultItem({ vault }: Props): JSX.Element {
  const {
    name,
    value,
    apr,
    yieldProjection: { harvestApr },
    protocol,
    lastHarvest,
    version,
  } = vault;

  let minYield = apr.minYield;
  let maxYield = apr.maxYield;

  if (version === VaultVersion.v1_5) {
    const boostedSources = vault.apr.sources.filter((s) => s.boostable);
    const boostedMinApr = boostedSources.reduce(
      (total, s) => total + s.performance.minYield,
      0,
    );
    const boostedMaxApr = boostedSources.reduce(
      (total, s) => total + s.performance.maxYield,
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
