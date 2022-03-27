import Image from "next/image";
import NavLink from "./NavLink";

function NavBar(): JSX.Element {
  return (
    <div className="flex w-full bg-calm shadow-lg border-b border-foam h-16 justify-center">
      <div className="mx-4 md:mx-0 w-full md:w-5/6 flex items-center">
        <div className="flex items-center mr-6 cursor-pointer" onClick={() => window.open('https://app.badger.com')}>
          <Image src={'/icon/badger-head.png'} width={25} height={25} />
        </div>
        <NavLink href="/" text="Overview" />
        <NavLink href="/rewards" text="Rewards" />
      </div>
    </div>
  );
}

export default NavBar;
