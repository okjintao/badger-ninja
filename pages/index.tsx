import { BadgerAPI, Currency, Network, VaultState } from '@badger-dao/sdk';
import { observer } from 'mobx-react-lite';
import { GetStaticPropsResult } from 'next';
import Link from 'next/link';
import { useContext, useEffect } from 'react';
import VaultItem from '../components/VaultItem';
import { NetworkSummary } from '../interfaces/network-summary.interface';
import getStore from '../store';
import { StoreContext } from '../store/StoreContext';

interface Props {
  networks: Record<string, NetworkSummary>;
}

const Landing = observer(({ networks }: Props): JSX.Element => {
  const { protocol } = useContext(StoreContext);
  const networkData = protocol.initialized ? protocol.networks : networks;

  const allNetworks = Object.values(networkData).filter((n) => n.tvl > 0);
  const allVaults = allNetworks.flatMap((v) => v.vaults);
  const totalVaults = allVaults.length;
  const totalValue = allVaults.reduce((total, v) => (total += v.value), 0);
  const totalNetworks = allNetworks.length;
  const valueApr = allVaults.reduce(
    (total, v) => (total += v.value * v.apr),
    0,
  );
  const protocolApr = valueApr / totalValue;
  const totalValueDisplay = `$${totalValue.toLocaleString()}`;
  const networksByTVL = allNetworks.sort((a, b) => b.tvl - a.tvl);
  const headerDisplay = `Badger has ${totalVaults} vaults farming ${totalValueDisplay} across ${totalNetworks} networks earning an average APR of ${protocolApr.toFixed(
    2,
  )}%`;

  return (
    <div className="flex flex-grow flex-col items-center w-full md:w-5/6 text-white pb-10 mx-auto">
      <div className="text-mint font-semibold text-xl leading-tight tracking-tight p-2 mt-4 text-center">
        {headerDisplay}
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
        <div className="text-xs text-gray-400 font-light tracking-tight leading-tight">
          Last Updated: {new Date(protocol.lastUpdatedAt).toLocaleString()}
        </div>
    </div>
  );
});

export async function getStaticProps(): Promise<GetStaticPropsResult<Props>> {
  const { protocol } = getStore();
  await protocol.loadProtocolData();
  return {
    props: {
      networks: protocol.networks,
    },
  };
}

export default Landing;
