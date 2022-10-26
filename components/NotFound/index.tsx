import { FC } from 'react';

import { Scope } from '../SVG/Scope';

export const NotFound: FC<Props> = ({ text }) => {
  const defaultText = `We couldn't find any matches for your search`;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full mb-12 mt-12">
      <Scope
        width={44}
        height={51}
        classNames={'fill-shallow text-shallow color'}
      />
      <div className="text-md font-bold text-shallow mb-5 mt-2">Hmmm....</div>
      <div className="text-xs font-bold text-shallow">
        {text || defaultText}.
      </div>
    </div>
  );
};

interface Props {
  text?: string;
}
