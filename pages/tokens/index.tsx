import { useContext } from 'react';

import { NetworkSummary } from '../../interfaces/network-summary.interface';
import { StoreContext } from '../../store/StoreContext';
import { getChainExplorer } from '../../utils';

function Tokens(): JSX.Element {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  const { protocol } = useContext(StoreContext);

  const networks: NetworkSummary[] = (
    protocol.initialized ? Object.values(protocol.networks) : []
  ).filter((n) => Object.values(n.tokens).length > 0);

  return (
    <div className="flex flex-grow flex-col items-center w-full md:w-11/12 text-white pb-10 mx-auto">
      <div className="my-2 w-full">
        {networks.map((n) => {
          const { name, tokens, prices } = n;
          return (
            <div>
              <div className="mt-14 mb-8">
                <span className="text-xl mr-5">{name}</span>
                <span className="text-xs text-gray-400">
                  {Object.keys(tokens).length} Tokens
                </span>
              </div>
              <div
                key={name}
                className="flex flex-col my-2 bg-card rounded large mx-2 lg:mx-0"
              >
                <div className="bg-slate grid grid-cols-4 lg:grid-cols-4 p-4 shadow-lg rounded-t-lg uppercase text-sm text-shallow">
                  <span>Vault</span>
                  <span>Token</span>
                  <span className="hidden lg:block">Price</span>
                  <span>Address</span>
                </div>
                <div key={name} className="flex flex-col bg-card rounded large">
                  {Object.values(tokens).map((t) => {
                    const { name, symbol, address } = t;
                    return (
                      <div
                        key={`${n.name}-${address}`}
                        className="grid grid-cols-4 mb-2 hover:bg-slate p-4"
                      >
                        <div className="flex m">
                          <span>{name}</span>
                        </div>
                        <div className="text-gray-400">{symbol}</div>
                        <div>{formatter.format(prices[address])}</div>
                        <div className="flex flex-row">
                          <a
                            href={`${getChainExplorer(
                              n.network,
                            )}/address/${address}`}
                            className="flex text-sea"
                          >
                            <svg
                              className="mt-1 mr-1 cursor-pointer"
                              fill="#3bba9c"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              width="15px"
                              height="15px"
                            >
                              <path d="M 5 3 C 3.9069372 3 3 3.9069372 3 5 L 3 19 C 3 20.093063 3.9069372 21 5 21 L 19 21 C 20.093063 21 21 20.093063 21 19 L 21 12 L 19 12 L 19 19 L 5 19 L 5 5 L 12 5 L 12 3 L 5 3 z M 14 3 L 14 5 L 17.585938 5 L 8.2929688 14.292969 L 9.7070312 15.707031 L 19 6.4140625 L 19 10 L 21 10 L 21 3 L 14 3 z" />
                            </svg>
                            {address.slice(0, 4)}...
                            {address.slice(address.length - 4, address.length)}
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Tokens;
