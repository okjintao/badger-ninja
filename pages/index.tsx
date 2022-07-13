import { BadgerAPI, Currency, Network, VaultState } from '@badger-dao/sdk';
import { observer } from 'mobx-react-lite';
import { GetServerSidePropsResult, GetStaticPropsResult } from 'next';
import Link from 'next/link';
import { useContext, useEffect } from 'react';

import VaultItem from '../components/VaultItem';
import { NetworkSummary } from '../interfaces/network-summary.interface';
import getStore from '../store';
import { StoreContext } from '../store/StoreContext';

interface Props {
  initialized: boolean;
  value: string | number;
}

function Highlight({ initialized, value }: Props): JSX.Element {
  return initialized ? (
    <span className="text-xl my-1">{value}</span>
  ) : (
    <div className="animate-pulse h-6 w-12 bg-slate rounded-lg my-1" />
  );
}

const Landing = observer((): JSX.Element => {
  const { protocol } = useContext(StoreContext);
  const networkData = protocol.initialized ? protocol.networks : {};

  const allNetworks = Object.values(networkData).filter(
    (n) =>
      n.vaults.filter((v) => v.state !== VaultState.Discontinued).length > 0,
  );
  const allVaults = allNetworks.flatMap((v) => v.vaults);
  const totalVaults = allVaults.length;
  const totalValue = allVaults.reduce((total, v) => (total += v.value), 0);
  const totalValueDisplay = `$${totalValue.toLocaleString()}`;
  const valueApr = allVaults.reduce(
    (total, v) => (total += v.value * v.apr),
    0,
  );
  const protocolApr = valueApr / totalValue;

  const networksByTVL = allNetworks.sort((a, b) => b.tvl - a.tvl);

  return (
    <div className="flex flex-grow flex-col items-center w-full md:w-5/6 text-white pb-10 mx-auto pt-8">
      <div className="grid grid-cols-4 w-full pb-6">
        <div className="bg-card flex flex-col m-2 px-4 py-8 rounded-lg">
          <span className="text-xs text-gray-400">Vaults</span>
          <Highlight initialized={protocol.initialized} value={totalVaults} />
        </div>
        <div className="bg-card flex flex-col m-2 px-4 py-8  rounded-lg">
          <span className="text-xs text-gray-400">Total Value Locked</span>
          <Highlight
            initialized={protocol.initialized}
            value={totalValueDisplay}
          />
        </div>
        <div className="bg-card flex flex-col m-2 px-4 py-8  rounded-lg">
          <span className="text-xs text-gray-400">Network</span>
          <Highlight
            initialized={protocol.initialized}
            value={networksByTVL.length}
          />
        </div>
        <div className="bg-card flex flex-col m-2 px-4 py-8  rounded-lg">
          <span className="text-xs text-gray-400">Avg. APR</span>
          <Highlight
            initialized={protocol.initialized}
            value={`${protocolApr.toFixed(2)}%`}
          />
        </div>
      </div>
      {Object.keys(networksByTVL).length === 0 && (
        <div className="grid w-full mb-6">
          <div className="flex items-center mb-2">
            <div className="text-xl mr-6">Ethereum</div>
            <div className="text-sm font-semibold text-sea">Registry</div>
          </div>
          <div className="bg-slate grid grid-cols-3 lg:grid-cols-4 p-4 shadow-lg rounded-t-lg uppercase text-sm text-shallow">
            <span>Vault</span>
            <span>TVL</span>
            <span className="hidden lg:block">APR</span>
            <span>Harvest Time</span>
          </div>
          <div className="flex flex-col">
            {Array.from(new Array(5)).map((_, i) => {
              return (
                <div
                  key={`vault_skeleton_${i}`}
                  className="bg-deep p-4 shadow-md border-slate border-t hover:bg-slate cursor-pointer grid grid-cols-3 lg:grid-cols-4 w-full"
                >
                  <span className="rounded-lg h-6 w-32 animate-pulse bg-slate" />
                  <span className="rounded-lg h-6 w-20 animate-pulse bg-slate" />
                  <span className="rounded-lg h-6 w-20 animate-pulse bg-slate" />
                  <span className="rounded-lg h-6 w-32 animate-pulse bg-slate" />
                </div>
              );
            })}
          </div>
        </div>
      )}
      {Object.keys(networksByTVL).length > 0 &&
        networksByTVL
          .filter((n) => n.tvl > 0 && n.vaults.length > 0)
          .map((n) => (
            <div className="grid w-full mb-6" key={n.network}>
              <div className="flex items-center mb-2">
                <div className="text-xl mr-6">{n.name}</div>
                <div className="text-sm font-semibold text-sea">Registry</div>
              </div>
              <div className="bg-slate grid grid-cols-3 lg:grid-cols-4 p-4 shadow-lg rounded-t-lg uppercase text-sm text-shallow">
                <span>Vault</span>
                <span>TVL</span>
                <span className="hidden lg:block">APR</span>
                <span>Harvest Time</span>
              </div>
              <div className="flex flex-col">
                {n.vaults
                  .slice()
                  .sort((a, b) => b.value - a.value)
                  .map((v) => {
                    const href = `/vault/${n.network}/${v.vaultToken}`;
                    return (
                      <Link href={href} key={href} passHref>
                        <a>
                          <VaultItem vault={v} />
                        </a>
                      </Link>
                    );
                  })}
              </div>
            </div>
          ))}
    </div>
  );
});

export default Landing;
