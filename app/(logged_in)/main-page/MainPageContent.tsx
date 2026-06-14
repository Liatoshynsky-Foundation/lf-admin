'use client';

import { Box } from '@mui/material';

import { styles } from './MainPageContent.styles';
import CardsGrid from '~/shared/components/cards-grid/CardsGrid';
import PageCard from '~/shared/components/page-card/PageCard';
import { PageHeader, PageHeaderTab } from '~/shared/components/page-header/PageHeader';
import { useGetPagesQuery } from '~/types/graphql/generated/graphql';

type MainPagesContentProps = Readonly<{
  activeTab: string;
}>;

const MAIN_PAGE_TABS: readonly PageHeaderTab[] = [
  { value: 'foundation', label: 'Фундація', href: '/main-page' },
  { value: 'other', label: 'Інші', href: '/' },
];

export function MainPagesContent({ activeTab }: MainPagesContentProps) {
  const { data, loading } = useGetPagesQuery({
    variables: { category: activeTab === 'all' ? undefined : activeTab }
  });

  if (loading || !data) return null;

  return (
    <Box sx={styles.mainPageContentWrapper}>
      <PageHeader title="Основні сторінки" activeTab={activeTab} tabs={MAIN_PAGE_TABS} />
      <CardsGrid columns={{ smCols: 1, mdCols: 2, xlCols: 3 }}>
        {
          data.pages.map((item) => (
            <PageCard
              key={item.id}
              coverImage={item.coverImage}
              title={item.title}
              updatedAt={item.updatedAt}
              editHref={item.slug}
              editSeoHref={item.slug}
            />
          ))
        }
      </CardsGrid>
    </Box>
  );
}
