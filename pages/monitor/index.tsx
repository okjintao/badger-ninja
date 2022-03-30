import {
  BadgerAPI,
  Network,
  Currency,
  VaultState,
  VaultVersion,
} from '@badger-dao/sdk';
import { GetStaticPropsResult } from 'next';
import VaultHarvestItem from '../../components/VaultHarvestItem';
import { VaultHarvestSummary } from '../../interfaces/vault-harvest-summary.interface';

interface Props {
  alertVaults: VaultHarvestSummary[];
  borderlineVaults: VaultHarvestSummary[];
  healthyVaults: VaultHarvestSummary[];
}

function VaultMonitor({
  alertVaults,
  borderlineVaults,
  healthyVaults,
}: Props): JSX.Element {
  return (
    <div className="flex flex-grow flex-col items-center w-full md:w-5/6 text-white pb-10 mx-auto mt-4">
      {alertVaults.map((v) => (
        <VaultHarvestItem
          key={`${v.networkName}-${v.name}`}
          harvestInformation={v}
        />
      ))}
      {borderlineVaults.map((v) => (
        <VaultHarvestItem
          key={`${v.networkName}-${v.name}`}
          harvestInformation={v}
        />
      ))}
      {healthyVaults.map((v) => (
        <VaultHarvestItem
          key={`${v.networkName}-${v.name}`}
          harvestInformation={v}
        />
      ))}
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
            address: v.vaultToken,
          };
          const { harvestValue, yieldValue } = v.yieldProjection;
          const harvestHealth = (harvestValue / yieldValue) * 100;
          if (harvestHealth >= 97) {
            healthyVaults.push(summary);
          } else if (harvestHealth >= 94) {
            borderlineVaults.push(summary);
          } else if (harvestHealth < 94) {
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
