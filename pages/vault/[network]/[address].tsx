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
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import VaultStatistic from '../../../components/VaultStatistic';
import {
  BadgerTreeDistribution_OrderBy,
  OrderDirection,
  SettHarvest_OrderBy,
  Transfer_OrderBy,
} from '@badger-dao/sdk/lib/graphql/generated/badger';
import { VaultTransfer } from '../../../interfaces/vault-transfer.interface';
import { getChainExplorer, shortenAddress } from '../../../utils';
import React, { useContext, useEffect, useState } from 'react';
import { VaultHarvestInfo } from '../../../interfaces/vault-harvest-info.interface';
import { RewardType } from '../../../enums/reward-type.enum';
import { ethers } from 'ethers';
import getStore from '../../../store';
import VaultSummary from '../../../components/VaultSummary';
import VaultChart from '../../../components/VaultChart';
import { BigNumber } from '@badger-dao/sdk/node_modules/ethers';
import VaultAprSources from '../../../components/VaultAprSources';
import VaultSchedules from '../../../components/VaultSchedules';
import VaultHarvestHealth from '../../../components/VaultHarvestHealth';
import VaultHarvestHistory from '../../../components/VaultHarvestHistory';
import { StoreContext } from '../../../store/StoreContext';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/router';
import VaultTransactionHistory from '../../../components/VaultTransactionHistory';

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
}

const PAGE_SIZE = 10;

const VaultInformation = observer((): JSX.Element => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

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

  if (!vaultInfo.vault) {
    return <></>
  }

  const { vault, transfers, chartData, schedules, harvests } = vaultInfo;
  const { version } = vault;

  return (
    <div className="flex flex-grow flex-col w-full md:11/12 lg:w-5/6 xl:w-3/4 text-gray-300 pb-10 mx-auto">
      <VaultSummary network={network} vault={vault} />
      <VaultChart chartData={chartData} vault={vault} />
      {version === VaultVersion.v1_5 && <VaultHarvestHealth vault={vault} />}
      <div className="mt-4 mx-2 lg:mx-0 grid grid-cols-1 md:grid-cols-2">
        <VaultAprSources vault={vault} />
        <VaultSchedules vault={vault} schedules={schedules} />
      </div>
      <VaultHarvestHistory network={network} harvests={harvests} />
      <VaultTransactionHistory vault={vault} network={network} transfers={transfers} />
    </div>
  );
});

export default VaultInformation;
