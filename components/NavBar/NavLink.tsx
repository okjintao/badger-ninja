import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

interface Props {
  href: string;
  text: string;
}

function NavLink({ href, text }: Props): JSX.Element {
  const router = useRouter();
  const isActive = router.asPath === href;
  return (
    <div
      className={`flex items-center font-semibold justify-center mt-1 px-2${
        isActive ? ' border-sea border-b-2' : ' mb-0.5'
      }`}
    >
      <Link href={href} passHref>
        <span
          className={`text-sm uppercase cursor-pointer text-white hover:text-sea hover:font-semibold`}
        >
          {text}
        </span>
      </Link>
    </div>
  );
}

export default NavLink;
