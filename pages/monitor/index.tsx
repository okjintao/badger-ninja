import {
  BadgerAPI,
  Network,
  Currency,
  VaultState,
  VaultYieldProjection,
  VaultVersion,
} from '@badger-dao/sdk';
import { GetStaticPropsResult } from 'next';
import { NetworkSummary } from '../../interfaces/network-summary.interface';
import { getChainExplorer } from '../../utils';

interface Props {
  alertVaults: VaultHarvestSummary[];
  borderlineVaults: VaultHarvestSummary[];
  healthyVaults: VaultHarvestSummary[];
}

type VaultHarvestSummary = {
  name: string;
  yieldProjection: VaultYieldProjection;
  networkName: string;
  network: Network;
  lastHarvest: number;
};

function VaultMonitor({
  alertVaults,
  borderlineVaults,
  healthyVaults,
}: Props): JSX.Element {
  return (
    <div className="flex flex-grow flex-col items-center w-full md:w-5/6 text-white pb-10 mx-auto">
      <span className="mt-6 text-3xl text-badger">
        Vaults v1.5 Monitoring Soon™
      </span>
    </div>
  );
}

export async function getStaticProps(): Promise<GetStaticPropsResult<Props>> {
  const api = new BadgerAPI({ network: 1 });

  const alertVaults: VaultHarvestSummary[] = [];
  const borderlineVaults: VaultHarvestSummary[] = [];
  const healthyVaults: VaultHarvestSummary[] = [];

  for (const network of Object.values(Network)) {
    try {
      const networkVaults = await api.loadVaults(Currency.USD, network);
      const networkName = network
        .split('-')
        .map((i) => i.charAt(0).toUpperCase() + i.slice(1))
        .join(' ');
      networkVaults
        .filter(
          (v) =>
            v.state !== VaultState.Deprecated &&
            v.version === VaultVersion.v1_5,
        )
        .forEach((v) => {
          const summary: VaultHarvestSummary = {
            network,
            networkName,
            name: v.name,
            yieldProjection: v.yieldProjection,
            lastHarvest: v.lastHarvest,
          };
          const { harvestValue, yieldValue } = v.yieldProjection;
          const harvestHealth = harvestValue / yieldValue;
          if (harvestHealth >= 97.5) {
            healthyVaults.push(summary);
          }
          if (harvestHealth >= 95) {
            borderlineVaults.push(summary);
          }
          if (harvestHealth < 95) {
            alertVaults.push(summary);
          }
        });
    } catch {} // some network are not supported
  }

  return {
    props: {
      alertVaults,
      borderlineVaults,
      healthyVaults,
    },
  };
}

export default VaultMonitor;
