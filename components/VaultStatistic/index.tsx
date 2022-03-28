import React from 'react';

interface Props {
  title: string | React.ReactNode;
  value: string | number | boolean | React.ReactNode;
  link?: string;
  subtext?: string | React.ReactNode;
}

function VaultStatistic({ title, value, link, subtext }: Props): JSX.Element {
  return (
    <>
      <div className="flex-col">
        <div className="text-sm text-gray-400">{title}</div>
        <div
          className={`text-md ${link ? ' text-mint cursor-pointer' : ''}`}
          onClick={() => {
            if (link) {
              window.open(link);
            }
          }}
        >
          {value}
        </div>
        {subtext && <div className="text-xs text-gray-300">{subtext}</div>}
      </div>
    </>
  );
}

export default VaultStatistic;
