import { observer } from 'mobx-react-lite';
import { useContext } from 'react';

import VaultHarvestItem from '../../components/VaultHarvestItem';
import { StoreContext } from '../../store/StoreContext';

const VaultMonitor = observer((): JSX.Element => {
  const { protocol: { vaultHarviestSummaries } } = useContext(StoreContext);
  const { alertVaults, borderlineVaults, healthyVaults} = vaultHarviestSummaries;

  return (
    <div className="flex flex-grow flex-col items-center w-full text-white mt-4">
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
});

export default VaultMonitor;
