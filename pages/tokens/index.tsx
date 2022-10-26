import { Token } from '@badger-dao/sdk/lib/tokens/interfaces/token.interface';
import classnames from 'classnames';
import { useContext } from 'react';

import { NotFound } from '../../components/NotFound';
import { Pagination } from '../../components/Pagination';
import { Search } from '../../components/Search';
import { BoxedArrowSVG } from '../../components/SVG/BoxedArrow';
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

  const TokensPagination = Pagination<Token>();
  const TokensSearch = Search<NetworkSummary>();

  return (
    <div className="my-1 w-full md:w-11/12 text-white pb-10 mx-auto">
      <TokensSearch
        items={networks}
        searchFunc={(items, query) => {
          if (!query || query.length <= 1) return items;

          const itemsCopy = JSON.parse(JSON.stringify(items));

          for (const network of itemsCopy) {
            for (const token of Object.keys(network.tokens)) {
              const tokenName = network.tokens[token].name.toLowerCase();

              if (!tokenName.includes(query.toLowerCase())) {
                delete network.tokens[token];
              }
            }
          }

          return itemsCopy;
        }}
        placeHolder="Search for a token"
      >
        {(searchNetworks, query) => (
          <div className="my-2 w-full">
            {searchNetworks.map((n, i) => {
              const { name, tokens, prices } = n;

              if (Object.values(networks[i].tokens).length === 0) return null;

              return (
                <div key={`${name}-base-holder`}>
                  <div
                    className={classnames('mb-8', {
                      ['mt-14']: i != 0,
                      ['mt-8']: i === 0,
                    })}
                  >
                    <span className="text-xl mr-5">{name}</span>
                    <span className="text-xs text-gray-400">
                      {Object.keys(tokens).length} Tokens
                    </span>
                  </div>
                  <TokensPagination
                    name={name}
                    perPage={15}
                    items={Object.values(tokens)}
                  >
                    {(items) => (
                      <div
                        key={name}
                        className="flex flex-col my-2 bg-card rounded large mx-2 lg:mx-0 min-h-1750"
                      >
                        <div className="bg-slate grid grid-cols-4 lg:grid-cols-4 p-4 shadow-lg rounded-t-lg uppercase text-sm text-shallow">
                          <span>Vault</span>
                          <span>Token</span>
                          <span className="hidden lg:block">Price</span>
                          <span>Address</span>
                        </div>
                        <div
                          key={name}
                          className="flex flex-col bg-card rounded large"
                        >
                          {Object.values(items).length === 0 &&
                          query.length > 0 ? (
                            <NotFound />
                          ) : (
                            items.map((t) => {
                              const { name, symbol, address } = t;
                              return (
                                <div
                                  key={`${n.name}-${address}`}
                                  className="grid grid-cols-4 pb-2 hover:bg-slate p-4 border-slate border-t"
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
                                      <BoxedArrowSVG />
                                      {address.slice(0, 4)}...
                                      {address.slice(
                                        address.length - 4,
                                        address.length,
                                      )}
                                    </a>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </TokensPagination>
                </div>
              );
            })}
          </div>
        )}
      </TokensSearch>
    </div>
  );
}

export default Tokens;
