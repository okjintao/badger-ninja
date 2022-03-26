import Link from "next/link";
import React from "react";

interface Props {
  href: string;
  text: string;
}

function NavLink({ href, text }: Props): JSX.Element {
  return (
    <Link href={href} passHref>
      <span className="mr-4 text-sm uppercase cursor-pointer text-white hover:text-mint hover:border-b border-mint">{text}</span>
    </Link>
  );
}

export default NavLink;
