import { GetStaticPropsResult } from 'next';

import { NetworkSummary } from '../../interfaces/network-summary.interface';
import getStore from '../../store';

interface Props {
  networks: NetworkSummary[];
}

function Tokens(): JSX.Element {
  return (
    <div className="flex flex-grow flex-col items-center w-full md:w-5/6 text-white pb-10 mx-auto"></div>
  );
}

export async function getServerSideProps(): Promise<
  GetStaticPropsResult<Props>
> {
  const { protocol } = getStore();
  await protocol.loadProtocolData();
  return {
    props: {
      networks: Object.values(protocol.networks),
    },
  };
}

export default Tokens;
