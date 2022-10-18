import classnames from 'classnames';
import { FC, useCallback, useState } from 'react';

export const Pagination: <T>() => FC<Props<T>> =
  () =>
  ({
    onSelectPage,
    perPage = MIN_PER_PAGE,
    items,
    name = 'main',
    children,
  }) => {
    if (perPage < MIN_PER_PAGE) perPage = MIN_PER_PAGE;

    const total = items.length;

    const [currentPage, setCurrentPage] = useState(1);
    const [pageItems, setPageItems] = useState(items.slice(0, perPage));

    const totalPages = Math.ceil(total / perPage);

    const handleSelectPage = useCallback(
      (page: number) => () => {
        setCurrentPage(page);
        setPageItems(items.slice((page - 1) * perPage, page * perPage));
        onSelectPage && onSelectPage(page);
      },
      [items],
    );

    const ratio = Math.floor(SHOW_PAGES / 2);

    const isLeftDisabled = currentPage - ratio <= 1;
    const isRightDisabled = currentPage + ratio >= totalPages;

    const handleSelectNextPage = useCallback(
      (direction: 'left' | 'right') => () => {
        if (
          (direction === 'left' && isLeftDisabled) ||
          (direction === 'right' && isRightDisabled)
        ) {
          return;
        }

        const nextPage =
          direction === 'left' ? currentPage - 1 : currentPage + 1;
        handleSelectPage(nextPage)();
      },
      [currentPage],
    );

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    const showArrows = totalPages > SHOW_PAGES;

    const pagesToShow =
      items.length > perPage
        ? pages.reduce((acc: number[], page) => {
            if (SHOW_PAGES <= acc.length) return acc;

            if (
              (page >= currentPage - ratio && page <= currentPage + ratio) ||
              pages.length <= SHOW_PAGES ||
              (Array.from({ length: ratio }, (_, i) => i + 1).includes(
                currentPage,
              ) &&
                Array.from(
                  { length: ratio },
                  (_, i) => i + Math.ceil(SHOW_PAGES / 2) + 1,
                ).includes(page)) ||
              (Array.from({ length: ratio }, (_, i) => totalPages - i).includes(
                currentPage,
              ) &&
                Array.from(
                  { length: ratio },
                  (_, i) => totalPages - (Math.ceil(SHOW_PAGES / 2) + i),
                ).includes(page))
            ) {
              acc.push(page);
            }

            return acc;
          }, [])
        : [];

    return (
      <div>
        {children(pageItems)}
        {pagesToShow.length > 1 && (
          <div className={`flex justify-end items-center text-sm mt-8 mr-4`}>
            {showArrows && (
              <div
                onClick={handleSelectNextPage('left')}
                className={classnames('mr-2', {
                  'text-shallow cursor-default': isLeftDisabled,
                  'text-primary cursor-pointer': !isLeftDisabled,
                })}
              >
                {'<'}
              </div>
            )}
            {pagesToShow.map((page) => (
              <div
                key={`${page}-pagination-${name}`}
                className={classnames('px-4 py-2', {
                  'cursor-pointer text-primary': page !== currentPage,
                  'cursor-default text-shallow bg-card rounded-3xl':
                    page === currentPage,
                })}
                onClick={handleSelectPage(page)}
              >
                {page}
              </div>
            ))}
            {showArrows && (
              <div
                onClick={handleSelectNextPage('right')}
                className={classnames('ml-2', {
                  'text-shallow cursor-default': isRightDisabled,
                  'text-primary cursor-pointer': !isRightDisabled,
                })}
              >
                {'>'}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

interface Props<T> {
  onSelectPage?: (page: number) => void;
  perPage: number;
  items: T[];
  name: string;
  children: (items: T[]) => JSX.Element;
}

const MIN_PER_PAGE = 10;
const SHOW_PAGES = 5;
