import BadgerSDK, {
  ChartGranularity,
  EmissionSchedule,
  formatBalance,
  getNetworkConfig,
  Network,
  PriceSummary,
  VaultDTO,
  VaultSnapshot,
  VaultVersion,
} from '@badger-dao/sdk';
import {
  BadgerTreeDistribution_OrderBy,
  OrderDirection,
  SettHarvest_OrderBy,
  Transfer_OrderBy,
} from '@badger-dao/sdk/lib/graphql/generated/badger';
import { BigNumber } from '@badger-dao/sdk/node_modules/ethers';
import { ethers } from 'ethers';
import { observer } from 'mobx-react-lite';
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';

import VaultAprSources from '../../../components/VaultAprSources';
import VaultChart from '../../../components/VaultChart';
import VaultHarvestHealth from '../../../components/VaultHarvestHealth';
import VaultHarvestHistory from '../../../components/VaultHarvestHistory';
import VaultSchedules from '../../../components/VaultSchedules';
import VaultStatistic from '../../../components/VaultStatistic';
import VaultSummary from '../../../components/VaultSummary';
import VaultTransactionHistory from '../../../components/VaultTransactionHistory';
import { RewardType } from '../../../enums/reward-type.enum';
import { VaultHarvestInfo } from '../../../interfaces/vault-harvest-info.interface';
import { VaultTransfer } from '../../../interfaces/vault-transfer.interface';
import getStore from '../../../store';
import { StoreContext } from '../../../store/StoreContext';
import { getChainExplorer, shortenAddress } from '../../../utils';

export interface VaultProps {
  vault?: VaultDTO;
  chartData: VaultSnapshot[];
  schedules: EmissionSchedule[];
  transfers: VaultTransfer[];
  network: Network;
  prices: PriceSummary;
  harvests: VaultHarvestInfo[];
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
      const result = await vaults.loadVaultData(network, address as string);
      setVaultInfo(result);
    }
    loadVaultInformation();
  }, [network, address, protocol.initialized]);

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
      <VaultChart chartData={chartData} vault={requestedVault} />
      {version === VaultVersion.v1_5 && (
        <VaultHarvestHealth vault={requestedVault} />
      )}
      <div className="mt-4 mx-2 lg:mx-0 grid grid-cols-1 md:grid-cols-2">
        <VaultAprSources vault={requestedVault} />
        <VaultSchedules vault={requestedVault} schedules={schedules} />
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
