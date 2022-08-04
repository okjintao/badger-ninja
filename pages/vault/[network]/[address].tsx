import {
  ChartTimeFrame,
  EmissionSchedule,
  getNetworkConfig,
  Network,
  PriceSummary,
  VaultDTO,
  VaultEarning,
  VaultSnapshot,
  VaultVersion,
} from '@badger-dao/sdk';
import { ethers } from 'ethers';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';

import VaultAprSources from '../../../components/VaultAprSources';
import VaultChart from '../../../components/VaultChart';
import VaultHarvestHealth from '../../../components/VaultHarvestHealth';
import VaultHarvestHistory from '../../../components/VaultHarvestHistory';
import VaultSchedules from '../../../components/VaultSchedules';
import VaultSummary from '../../../components/VaultSummary';
import VaultTransactionHistory from '../../../components/VaultTransactionHistory';
import { VaultTransfer } from '../../../store/interfaces/vault-transfer.interface';
import { StoreContext } from '../../../store/StoreContext';

export interface VaultProps {
  vault?: VaultDTO;
  chartData: VaultSnapshot[];
  schedules: EmissionSchedule[];
  transfers: VaultTransfer[];
  network: Network;
  prices: PriceSummary;
  harvests: VaultEarning[];
}

export const defaultProps: VaultProps = {
  chartData: [],
  schedules: [],
  transfers: [],
  network: Network.Ethereum,
  prices: {},
  harvests: [],
};

const PAGE_SIZE = 10;

const VaultInformation = observer((): JSX.Element => {
  const router = useRouter();
  const { network: requestedNetwork, address } = router.query;
  const [vaultInfo, setVaultInfo] = useState(defaultProps);
  const [timeframe, setTimeframe] = useState(ChartTimeFrame.Max);

  let network: Network;
  try {
    network = getNetworkConfig(requestedNetwork as string).network;
  } catch {
    network = Network.Ethereum;
  }

  const { vaults, protocol } = useContext(StoreContext);
  useEffect(() => {
    async function loadVaultInformation() {
      if (!address || address.length === 0) {
        return;
      }
      const result = await vaults.loadVaultData(
        network,
        address as string,
        timeframe,
      );
      setVaultInfo(result);
    }
    loadVaultInformation();
  }, [network, address, protocol.initialized, timeframe]);

  if (!protocol.initialized) {
    return <></>;
  }

  const searchAddress = ethers.utils.getAddress(address as string);
  const requestedVault = protocol.networks[network].vaults.find(
    (v) => v.vaultToken === searchAddress,
  );

  if (!requestedVault) {
    return <></>;
  }

  const { version } = requestedVault;
  const { transfers, chartData, schedules, harvests } = vaultInfo;

  return (
    <div className="flex flex-grow flex-col w-full md:11/12 lg:w-5/6 xl:w-3/4 text-gray-300 pb-10 mx-auto">
      <VaultSummary network={network} vault={requestedVault} />
      <VaultChart
        chartData={chartData}
        vault={requestedVault}
        timeframe={timeframe}
        setTimeframe={setTimeframe}
      />
      {version === VaultVersion.v1_5 && (
        <VaultHarvestHealth vault={requestedVault} />
      )}
      <div className="mt-10 mx-2 lg:mx-0 grid grid-cols-1 md:grid-cols-2">
        <VaultAprSources vault={requestedVault} />
        <VaultSchedules vault={requestedVault} schedules={schedules} />
      </div>
      <div className="flex mt-10 items-center justify-center text-shallow w-full text-sm">
        <span>
          Vault Transfer and Harvest History are not stable, and under active
          development.
        </span>
      </div>
      <VaultHarvestHistory network={network} harvests={harvests} />
      <VaultTransactionHistory
        vault={requestedVault}
        network={network}
        transfers={transfers}
      />
    </div>
  );
});

export default VaultInformation;
