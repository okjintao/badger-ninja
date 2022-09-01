import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import { useContext } from 'react';

import { StoreContext } from '../../store/StoreContext';
import ConnectButton from '../ConnectButton';
import NavLink from './NavLink';

const NavBar = observer((): JSX.Element => {
  const { updatedAt } = useContext(StoreContext);
  return (
    <div className="flex w-full bg-slate shadow-xl h-24 justify-center">
      <div className="flex flex-col mx-4 md:mx-0 w-full md:w-11/12 mt-3">
        <div className="flex w-full justify-between items-center">
          <div
            className="mr-6 cursor-pointer flex items-center flex-grow"
            onClick={() => window.open('https://app.badger.com')}
          >
            <Image
              alt="badger"
              src={'/icon/badger-head.png'}
              width={25}
              height={25}
            />
          </div>
          <>
            <div className="text-xs text-gray-300 mr-2">
              Updated at: {new Date(updatedAt).toLocaleString()}
            </div>
            <div
              className="mx-1 flex items-center cursor-pointer"
              onClick={() => window.open('https://discord.gg/5S26srvtmC')}
            >
              <Image
                alt="discord"
                src="/icon/discord.svg"
                width={15}
                height={15}
              />
            </div>
            <div
              className="mx-1 flex items-center cursor-pointer"
              onClick={() => window.open('https://twitter.com/badgerdao')}
            >
              <Image
                alt="twitter"
                src="/icon/twitter.svg"
                width={15}
                height={15}
              />
            </div>
          </>
        </div>
        <div className="flex w-full justify-between items-center mt-auto">
          <div className="flex h-full">
            <NavLink href="/" text="Overview" />
            <NavLink href="/monitor" text="Monitor" />
            <NavLink href="/tokens" text="Tokens" />
          </div>
          <div className="mb-2">
            <ConnectButton />
          </div>
        </div>
      </div>
    </div>
  );
});

export default NavBar;
