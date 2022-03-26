import { VaultDTO, VaultVersion } from "@badger-dao/sdk";

interface Props {
  vault: VaultDTO;
}

function VaultItem({ vault }: Props): JSX.Element {
  const { name, value, apy, minApy, maxApy, yieldProjection: { harvestApy }, protocol, lastHarvest, version, sources } = vault;

  let minYield = minApy ?? apy;
  let maxYield = maxApy ?? apy;

  if (version === VaultVersion.v1_5) {
    const boostedSources = sources.filter((s) => s.boostable);
    const boostedApy = boostedSources.reduce((total, s) => total + s.apr, 0);
    minYield = (minYield - boostedApy) + harvestApy;
    maxYield = (maxYield - boostedApy) + harvestApy;
  }

  const hasYieldRange = minYield < maxYield;
  const yieldDisplay = `${minYield.toFixed(2)}%${hasYieldRange ? ` - ${maxYield.toFixed(2)}%` : ''}`
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
      <div className="flex justify-between items-end">
        {lastHarvest > 0 && 
          <div className="text-xs">Harvested: {new Date(lastHarvest * 1000).toLocaleString()}</div>
        }
      </div>
    </div>
  )
}

export default VaultItem;
