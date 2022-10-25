import { FC, useCallback, useState } from 'react';

import { Lens } from '../SVG/Lens';

export const Search: <T>() => FC<Props<T>> =
  () =>
  ({ items, searchFunc, placeHolder, children }) => {
    const [search, setSearch] = useState('');
    const [searchItems, setSearchItems] = useState(items);

    const handleSearchInput = useCallback((e) => {
      setSearchItems(searchFunc(items, e.target.value));
      setSearch(e.target.value);
    }, []);

    if (searchItems.length === 0 && search.length === 0) {
      return null;
    }

    return (
      <div>
        <div className="mt-8 relative">
          <div className="absolute bottom-3 left-4">
            <Lens
              width={17}
              height={17}
              classNames={'fill-shallow text-shallow color'}
            />
          </div>
          <input
            onInput={handleSearchInput}
            value={search}
            placeholder={placeHolder}
            className={'bg-slate w-full py-2 pr-0 pl-11 rounded-md'}
          />
        </div>
        {children(searchItems, search)}
      </div>
    );
  };

interface Props<T> {
  items: T[];
  placeHolder?: string;
  searchFunc: (items: T[], query: string) => T[];
  children: (items: T[], query: string) => JSX.Element;
}
