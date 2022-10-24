import { getNetworkConfig, Network } from '@badger-dao/sdk';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/router';
import { useContext, useEffect } from 'react';

import { BoxedArrowSVG } from '../../components/SVG/BoxedArrow';
import { StoreContext } from '../../store/StoreContext';
import { getChainExplorer } from '../../utils';

const NetworkRegistry = observer((): JSX.Element => {
  const router = useRouter();
  const { network: requestedNetwork } = router.query;
  const { protocol } = useContext(StoreContext);

  let network: Network;
  try {
    network = getNetworkConfig(requestedNetwork as string).network;
  } catch {
    network = Network.Ethereum;
  }

  useEffect(() => {
    async function loadRegistryInformation() {
      await protocol.loadRegistry(network);
    }
    loadRegistryInformation();
  }, [network]);

  const networkName = network
    .split('-')
    .map((w) => w.charAt(0).toUpperCase().concat(w.slice(1)))
    .join(' ');

  return (
    <div className="flex flex-grow flex-col w-full md:11/12 lg:w-5/6 xl:w-3/4 text-gray-300 pb-10 mx-auto">
      <div className="mt-6 text-xl">Badger DAO Contract Registry</div>
      <div className="text-md mb-6 text-sea">{networkName}</div>
      <div className="w-full h-full">
        <div className="grid grid-cols-2 bg-slate p-2 shadow-lg rounded-t-lg uppercase text-sm text-shallow border-b">
          <span>Contract</span>
          <span>Address</span>
        </div>
        {Object.keys(protocol.registryEntries).length === 0 && (
          <div className="flex flex-col items-center w-full h-full justify-center h-64">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 animate-spin"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
            <span className="text-xl pt-6">{`Loading ${networkName} Registry...`}</span>
          </div>
        )}
        {Object.entries(protocol.registryEntries).map((e) => {
          const [key, value] = e;
          return (
            <div
              className="bg-card grid grid-cols-2 hover:bg-slate p-2 text-sm border-gray-300 border-opacity-25 border-b"
              key={key}
            >
              <span>{key}</span>
              <div className="flex flex-row">
                <a
                  target="_blank"
                  href={`${getChainExplorer(network)}/address/${value}`}
                  className="flex text-sea"
                >
                  <span className="pr-2">{value}</span>
                  <BoxedArrowSVG />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default NetworkRegistry;
