import { formatBalance, Network, VaultDTO } from '@badger-dao/sdk';
import { observer } from 'mobx-react-lite';
import React, { useContext, useEffect, useState } from 'react';

import { StoreContext } from '../../store/StoreContext';
import { getChainExplorer, shortenAddress } from '../../utils';
import VaultStatistic from '../VaultStatistic';

interface Props {
  network: Network;
  vault: VaultDTO;
}

const toExplorerLink = (network: Network, address: string) =>
  `${getChainExplorer(network)}/address/${address}`;
const toReadableFee = (fee: number) => `${fee / 100}%`;

const VaultSummary = observer(({ vault, network }: Props): JSX.Element => {
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

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  const store = useContext(StoreContext);
  const { prices } = store.protocol.networks[network];
  const underlyingTokenPrice = prices[underlyingToken];

  const [vaultBalance, setVaultBalance] = useState(0);
  const [underlyingBalance, setUnderlyingBalance] = useState(0);
  useEffect(() => {
    async function fetchBalances() {
      if (store.sdk.address) {
        const tokenInfo = await store.sdk.tokens.loadBalances([
          vaultToken,
          underlyingToken,
        ]);
        setVaultBalance(formatBalance(tokenInfo[vaultToken], 18));
        setUnderlyingBalance(formatBalance(tokenInfo[underlyingToken], 18));
      }
    }
    fetchBalances();
  }, [store.user.address]);

  const stateDisplay = state.charAt(0).toUpperCase() + state.slice(1);

  return (
    <div className="bg-card mt-4 md:mt-8 p-3 md:p-4 rounded-lg mx-2 lg:mx-0">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col w-full">
          <div className="text-xs text-gray-400">Vault Information</div>
          <div className="text-3xl font-semibold text-white">
            {name} - ${value.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400">
            {version} - {stateDisplay}
          </div>
        </div>
        {(vaultBalance || underlyingBalance) && (
          <div className="flex flex-col lg:flex-row justify-center lg:justify-end lg:items-center lg:col-span-2">
            <div className="text-xs grid grid-cols-2 mt-2 md:mt-0">
              <div className="flex flex-col">
                <div className="text-gray-300">Wallet</div>
                <div className="text-white text-sm">
                  {underlyingBalance} {asset}
                </div>
                <div>
                  {formatter.format(underlyingBalance * underlyingTokenPrice)}
                </div>
              </div>
              <div className="flex flex-col">
                <div className="text-gray-300">Vault</div>
                <div className="text-white text-sm">
                  {vaultBalance} {asset}
                </div>
                <div>
                  {formatter.format(vaultBalance * underlyingTokenPrice)}
                </div>
              </div>
            </div>
            <div className="flex space-x-3 mt-2 lg:mt-0 md:justify-start lg:justify-end lg:ml-5 flex-shrink-0">
              <div className="bg-deepsea p-2 rounded-lg shadow-lg opacity-50 cursor-pointer">
                Deposit
              </div>
              <div className="bg-deepsea p-2 rounded-lg shadow-lg opacity-50 cursor-pointer">
                Withdraw
              </div>
            </div>
          </div>
        )}
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
});

export default VaultSummary;
