import Image from 'next/image';
import ConnectButton from '../ConnectButton';
import NavLink from './NavLink';

function NavBar(): JSX.Element {
  return (
    <div className="flex w-full bg-calm shadow-lg border-b border-foam h-24 justify-center">
      <div className="flex flex-col mx-4 md:mx-0 w-full md:w-5/6 mt-3 mb-2">
        <div className="flex w-full">
          <div
            className="mr-6 cursor-pointer flex items-center"
            onClick={() => window.open('https://app.badger.com')}
          >
            <Image src={'/icon/badger-head.png'} width={25} height={25} />
          </div>
        </div>
        <div className="flex w-full justify-between items-center mt-auto">
          <div className="flex">
            <NavLink href="/" text="Overview" />
            <NavLink href="/monitor" text="Monitor" />
            <NavLink href="/tokens" text="Tokens" />
          </div>
          <ConnectButton />
        </div>
      </div>
    </div>
  );
}

export default NavBar;
