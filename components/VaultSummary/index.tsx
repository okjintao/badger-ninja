import React from 'react';
import { Network, VaultDTO } from '@badger-dao/sdk';
import VaultStatistic from '../VaultStatistic';
import { getChainExplorer, shortenAddress } from '../../utils';

interface Props {
  network: Network;
  vault: VaultDTO;
}

const toExplorerLink = (network: Network, address: string) =>
  `${getChainExplorer(network)}/address/${address}`;
const toReadableFee = (fee: number) => `${fee / 100}%`;

function VaultSummary({ vault, network }: Props): JSX.Element {
  const {
    name,
    value,
    pricePerFullShare,
    vaultAsset,
    asset,
    balance,
    available,
    lastHarvest,
    version,
    protocol,
    underlyingToken,
    vaultToken,
    state,
    strategy,
  } = vault;
  const {
    address: strategyAddress,
    performanceFee,
    strategistFee,
    withdrawFee,
    aumFee,
  } = strategy;

  const stateDisplay = state.charAt(0).toUpperCase() + state.slice(1);

  return (
    <div className="bg-calm mt-4 md:mt-8 p-3 md:p-4 rounded-lg mx-2 md:mx-0">
      <div className="flex justify-between">
        <div className="flex flex-col">
          <div className="text-sm text-gray-400">Vault Information</div>
          <div className="text-3xl font-semibold text-white">
            {name} - ${value.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400">
            {version} - {stateDisplay}
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <div className="flex space-x-3">
            <div className="bg-deepsea p-2 rounded-lg shadow-lg opacity-50 cursor-pointer">
              Deposit
            </div>
            <div className="bg-deepsea p-2 rounded-lg shadow-lg opacity-50 cursor-pointer">
              Withdraw
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 mb-2 grid grid-cols-2 lg:grid-cols-4">
        <VaultStatistic title="Protocol" value={protocol} />
        <VaultStatistic
          title="Last Harvest"
          value={new Date(lastHarvest * 1000).toLocaleString()}
        />
        <VaultStatistic
          title={`${asset} per ${vaultAsset}`}
          value={pricePerFullShare}
        />
        <VaultStatistic title="Balance" value={balance} />
        <VaultStatistic title="Available" value={available} />
        <VaultStatistic
          title="Deposit Token"
          value={shortenAddress(underlyingToken)}
          link={toExplorerLink(network, underlyingToken)}
        />
        <VaultStatistic
          title="Vault Token"
          value={shortenAddress(vaultToken)}
          link={toExplorerLink(network, vaultToken)}
        />
        <VaultStatistic
          title="Strategy"
          value={shortenAddress(strategyAddress)}
          link={toExplorerLink(network, strategyAddress)}
        />
        <VaultStatistic
          title="Performance Fee"
          value={toReadableFee(performanceFee)}
        />
        <VaultStatistic
          title="Strategist Fee"
          value={toReadableFee(strategistFee)}
        />
        <VaultStatistic
          title="Withdraw Fee"
          value={toReadableFee(withdrawFee)}
        />
        <VaultStatistic title="Management Fee" value={toReadableFee(aumFee)} />
      </div>
    </div>
  );
}

export default VaultSummary;
