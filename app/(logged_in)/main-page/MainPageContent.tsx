'use client';

import { Box } from '@mui/material';

import { styles } from './MainPageContent.styles';
import CardsGrid from '~/shared/components/cards-grid/CardsGrid';
import PageCard from '~/shared/components/page-card/PageCard';
import { PageHeader, PageHeaderTab } from '~/shared/components/page-header/PageHeader';
import { PageCategory } from '~/types/enums/common.enums';
import type { PageCategories as PageCategoriesType} from '~/types/graphql/generated/graphql';
import { useGetPagesQuery } from '~/types/graphql/generated/graphql';

export type ValidTab = 'all' | Extract<PageCategoriesType, 'foundation' | 'other'>;

type MainPagesContentProps = Readonly<{
  activeTab: ValidTab
}>;

const MAIN_PAGE_TABS: readonly PageHeaderTab[] = [
  { value: 'all', label: 'Всі', href: '/main-page' },
  { value: PageCategory.Foundation, label: 'Фундація', href: '/main-page/foundation' },
  { value: PageCategory.Other, label: 'Інші', href: '/main-page/other' },
];

const ALLOWED_SLUGS = new Set(['about-us', 'privacy-policy']);

export function MainPagesContent({ activeTab }: MainPagesContentProps) {
  const { data, loading } = useGetPagesQuery({
    variables: { category: activeTab === 'all' ? undefined : activeTab }
  });

  if (loading || !data) return null;

  const visiblePages = data.pages.filter((item) => 
    ALLOWED_SLUGS.has(item.slug)
  );

  return (
    <Box sx={styles.mainPageContentWrapper}>
      <PageHeader title="Основні сторінки" activeTab={activeTab} tabs={MAIN_PAGE_TABS} />
      <CardsGrid columns={{ smCols: 1, mdCols: 2, xlCols: 3 }}>
        {
          visiblePages.map((item) => (
            <PageCard
              key={item.id}
              coverImage={item.coverImage}
              title={item.title}
              updatedAt={item.updatedAt}
              editHref={`/${item.slug}`}
              editSeoHref={item.slug}
            />
          ))
        }
      </CardsGrid>
    </Box>
  );
}
