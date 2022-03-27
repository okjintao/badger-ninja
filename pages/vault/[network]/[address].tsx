import { BadgerAPI, Currency, Network, VaultDTO } from "@badger-dao/sdk";
import { GetStaticPathsResult, GetStaticPropsContext, GetStaticPropsResult } from "next";

interface Props {
  vault: VaultDTO;
}

type VaultPathParms = { network: string, address: string };

function VaultInformation({ vault }: Props): JSX.Element {
  const { name, value } = vault;
  return (
    <div className="flex flex-grow flex-col w-full md:w-5/6 text-white pb-10 mx-auto">
      <div className="bg-calm mt-2 md:mt-8 p-2 md:p-4 rounded-lg">
        <div className="text-sm">Vault Information</div>
        <div className="text-3xl font-semibold text-mint">{name} - ${value.toLocaleString()}</div>
        <div className="flex">
          <div className="w-full lg:w-1/4">
            <div className="flex md:flex-col">
              <div className="text-deepsea">
                pricePerFullShare
              </div>
            </div>
          </div>
          <div className="w-full lg:w-3/4">
            
          </div>
        </div>
      </div>
    </div>
  );
}


export async function getStaticProps({ params }: GetStaticPropsContext<VaultPathParms>): Promise<GetStaticPropsResult<Props>> {
  if (!params) {
    throw new Error('Building page with no params!');
  }

  const { network, address } = params;
  const api = new BadgerAPI({ network });
  const vault = await api.loadVault(address);

  return {
    props: {
      vault,
    }
  };
}

export async function getStaticPaths(): Promise<GetStaticPathsResult<VaultPathParms>> {
  const api = new BadgerAPI({ network: 1 });

  let paths: { params: VaultPathParms }[] = [];

  for (const network of Object.entries(Network)) {
    try {
      const [_key, value] = network;
      const networkVaults = await api.loadVaults(Currency.USD, value);
      const pathParams = networkVaults.map((v) => ({ params: { address: v.vaultToken, network: value } }));
      paths = paths.concat(pathParams);
    } catch {
    } // some network are not supported
  }

  return {
    paths,
    fallback: false,
  }
}

export default VaultInformation;
