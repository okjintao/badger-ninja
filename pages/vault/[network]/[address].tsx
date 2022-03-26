import { BadgerAPI, Currency, Network, VaultDTO } from "@badger-dao/sdk";
import { GetStaticPathsResult, GetStaticPropsContext, GetStaticPropsResult } from "next";

interface Props {
  vault: VaultDTO;
}

type VaultPathParms = { network: string, address: string };

function VaultInformation({ vault }: Props): JSX.Element {
  const { name } = vault;
  return (
    <div className="flex flex-grow flex-col items-center w-full md:w-5/6 text-white pb-10 mx-auto">
      <span>{name}</span>
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

  for (const network of Object.keys(Network)) {
    try {
      const networkVaults = await api.loadVaults(Currency.USD, network as Network);
      const pathParams = networkVaults.map((v) => ({ params: { address: v.vaultToken, network } }));
      paths = paths.concat(pathParams);
    } catch {} // some network are not supported
  }

  return {
    paths,
    fallback: false,
  }
}

export default VaultInformation;
