import {
  BadgerAPI,
  Currency,
  Network,
  VaultState,
  VaultVersion,
} from '@badger-dao/sdk';
import { GetStaticPropsResult } from 'next';

import VaultHarvestItem from '../../components/VaultHarvestItem';
import { VaultHarvestSummary } from '../../interfaces/vault-harvest-summary.interface';
import getStore from '../../store';

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

export async function getServerSideProps(): Promise<
  GetStaticPropsResult<Props>
> {
  const store = getStore();

  const alertVaults: VaultHarvestSummary[] = [];
  const borderlineVaults: VaultHarvestSummary[] = [];
  const healthyVaults: VaultHarvestSummary[] = [];

  for (const network of Object.values(Network)) {
    if (network === Network.Local || network == Network.Optimism) {
      continue;
    }
    try {
      const networkVaults = await store.sdk.api.loadVaults(
        Currency.USD,
        network,
      );
      const networkName = network
        .split('-')
        .map((i) => i.charAt(0).toUpperCase() + i.slice(1))
        .join(' ');
      networkVaults
        .filter(
          (v) =>
            v.state !== VaultState.Discontinued &&
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
