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
  return initialized ? <span className='text-xl my-1'>{value}</span> : <div className='animate-pulse h-6 w-12 bg-slate rounded-lg my-1' />
}

const Landing = observer((): JSX.Element => {
  const { protocol } = useContext(StoreContext);
  const networkData = protocol.initialized ? protocol.networks : {};

  const allNetworks = Object.values(networkData).filter((n) => n.tvl > 0);
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
      <div className='grid grid-cols-4 w-full pb-6'>
        <div className='bg-card flex flex-col m-2 px-4 py-8 rounded-lg'>
          <span className='text-xs text-gray-400'>Vaults</span>
          <Highlight initialized={protocol.initialized} value={totalVaults} />
        </div>
        <div className='bg-card flex flex-col m-2 px-4 py-8  rounded-lg'>
          <span className='text-xs text-gray-400'>Total Value Locked</span>
          <Highlight initialized={protocol.initialized} value={totalValueDisplay} />
        </div>
        <div className='bg-card flex flex-col m-2 px-4 py-8  rounded-lg'>
          <span className='text-xs text-gray-400'>Network</span>
          <Highlight initialized={protocol.initialized} value={networksByTVL.length} />
        </div>
        <div className='bg-card flex flex-col m-2 px-4 py-8  rounded-lg'>
          <span className='text-xs text-gray-400'>Avg. APR</span>
          <Highlight initialized={protocol.initialized} value={`${protocolApr.toFixed(2)}%`} />
        </div>
      </div>
      {networksByTVL
        .filter((n) => n.tvl > 0 && n.vaults.length > 0)
        .map((n) => (
          <div className="grid w-full" key={n.network}>
            <div className="text-lg ml-2">{n.name}</div>
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4">
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
