import { BadgerAPI, Network, Currency, VaultState } from "@badger-dao/sdk";
import { GetStaticPropsResult } from "next";
import { NetworkSummary } from "../../interfaces/network-summary.interface";

interface Props {
  networks: NetworkSummary[];
}

function Tokens({ networks }: Props): JSX.Element {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  return (
    <div className="flex flex-grow flex-col items-center w-full md:w-5/6 text-white pb-10 mx-auto">
      <div className="my-2 mx-2 md:mx-0 w-full">
        {networks.map((n) => {
          const { name, tokens, prices } = n;
          return (
            <div key={name} className="flex flex-col my-2 bg-calm p-2 rounded large">
              <span className="text-xl">{name}</span>
              <span className="text-xs text-gray-400">{Object.keys(tokens).length} Tokens</span>
              <div className="mt-2 mx-2">
                {Object.values(tokens).map((t) => {
                  const { name, symbol, address } = t;
                  return (
                    <div key={`${n.name}-${address}`} className="grid grid-cols-2 mb-1">
                      <div className="flex flex-col">
                        <span>{name}</span>
                        <span className="text-xs text-gray-400">{symbol}</span>
                      </div>
                      <span>{formatter.format(prices[address])}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export async function getStaticProps(): Promise<GetStaticPropsResult<Props>> {
  const api = new BadgerAPI({ network: 1 });

  const networks = [];
  for (const network of Object.values(Network)) {
    try {
      const networkVaults = await api.loadVaults(Currency.USD, network);
      networks.push({
        name: network.split('-').map((i) => i.charAt(0).toUpperCase() + i.slice(1)).join(' '),
        vaults: networkVaults.filter((v) => v.state !== VaultState.Deprecated),
        tvl: networkVaults.reduce((total, v) => total += v.value, 0),
        tokens: await api.loadTokens(network),
        prices: await api.loadPrices(Currency.USD, network),
        network,
      });
    } catch {} // some network are not supported
  }

  return {
    props: {
      networks,
    }
  };
}

export default Tokens;
