import { Pagination as MuiPagination, PaginationItem, PaginationProps as MuiPaginationProps } from '@mui/material';
import { ChangeEvent } from 'react';

import ChevronLeftIcon from '~/public/icons/chevronLeft.svg';
import ChevronRightIcon from '~/public/icons/chevronRight.svg';


interface PaginationProps extends Omit<MuiPaginationProps, 'count' | 'page' | 'onChange'> {
    totalPages?: number
    currentPage?: number
    onPageChange?: (event: ChangeEvent<unknown>, page: number) => void;
}


export const Pagination = ({ totalPages, currentPage, onPageChange, ...rest }: Readonly<PaginationProps>) => {
  return (
    <MuiPagination count={totalPages} page={currentPage} onChange={onPageChange} renderItem={(item) => (
      <PaginationItem
        slots={{
          previous: ChevronLeftIcon,
          next: ChevronRightIcon,
        }}
        {...item}
      />
    )} {...rest} />
  );
};