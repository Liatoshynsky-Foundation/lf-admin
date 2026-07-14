import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect } from 'react';


const validateSearchPage = (pageFromParams: string | null, totalPages: number) => {
  const numberPageFromParams = Number(pageFromParams);
  if (Number.isNaN(numberPageFromParams) || numberPageFromParams < 1) return 1;
  if (numberPageFromParams > totalPages) return totalPages;
  return numberPageFromParams;
};

export const usePageQueryParam = ({ totalPages }: { totalPages: number }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = searchParams.get('page');
  const validSearchPage = validateSearchPage(page, totalPages);

  const setPage = useCallback((newCurrentPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newCurrentPage.toString());
    router.replace(`${pathname}?${params.toString()}`);
  }, [searchParams, pathname, router]);

  useEffect(() => {
    if (page !== validSearchPage.toString()) {
      setPage(validSearchPage);
    }
  }, [validSearchPage, setPage, page]);

  return { page: validSearchPage, setPage };
};