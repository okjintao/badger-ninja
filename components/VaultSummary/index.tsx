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

  const _formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  const store = useContext(StoreContext);
  const { prices } = store.protocol.networks[network];
  const _underlyingTokenPrice = prices[underlyingToken];

  const [_vaultBalance, setVaultBalance] = useState(0);
  const [_underlyingBalance, setUnderlyingBalance] = useState(0);
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

  const _stateDisplay = state.charAt(0).toUpperCase() + state.slice(1);

  return (
    <div className="mt-8">
      <div className="flex justify-between mx-2 lg:mx-0 ">
        <div className="flex flex-col">
          <div className="text-2xl text-white">
            {protocol} - {name} - ${value.toLocaleString()}
          </div>
          <span className="text-shallow text-sm">
            Last Harvest: {new Date(lastHarvest).toLocaleString()}
          </span>
        </div>

        <div className="flex space-x-3 mt-2 lg:mt-0 md:justify-start lg:justify-end lg:ml-5 flex-shrink-0 items-center">
          <div className="py-2 px-4 rounded-lg shadow-lg cursor-pointer border-badger border text-badger text-sm uppercase">
            Withdraw
          </div>
          <div className="bg-badger py-2 px-4 rounded-lg shadow-lg cursor-pointer text-cave  text-sm uppercase">
            Deposit
          </div>
        </div>
      </div>
      <div className="bg-card mt-4 md:mt-8 p-3 md:p-4 rounded-lg mx-2 lg:mx-0 lg:px-10">
        <div className="mt-4 mb-2 grid grid-cols-2 lg:grid-cols-5">
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
          <VaultStatistic
            title="Management Fee"
            value={toReadableFee(aumFee)}
          />
          <VaultStatistic title="Balance" value={balance} />
          <VaultStatistic
            title={`${asset} per ${vaultAsset}`}
            value={pricePerFullShare}
          />
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
          <VaultStatistic title="Available" value={available} />
        </div>
      </div>
    </div>
  );
});

export default VaultSummary;
