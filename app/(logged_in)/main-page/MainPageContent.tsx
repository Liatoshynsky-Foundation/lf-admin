'use client';

import { Box, Typography } from '@mui/material';

import PageCard from '~/shared/components/page-card/PageCard';
import { PageHeader, PageHeaderTab } from '~/shared/components/page-header/PageHeader';

type MainPagesContentProps = Readonly<{
  activeTab: string;
}>;

const MAIN_PAGE_TABS: readonly PageHeaderTab[] = [
  { value: 'all', label: 'Всі', href: '/main-page/all' },
  { value: 'foundation', label: 'Фундація', href: '/main-page' }
];

const items = [
  {
    id: '1',
    coverImage: {
      src: '/images/temp_page-card-static.png',
      alt: {
        uk: 'Сторінка Про нас статична зображення',
        en: 'About Us page static image'
      }
    },
    titleData: {
      uk: 'Про нас',
      en: 'About us'
    },
    updatedAt: '2025-09-11',
    editHref: '/about-us',
    editSeoHref: '/about-us'
  }
];

export function MainPagesContent({ activeTab }: MainPagesContentProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <PageHeader title="Основні сторінки" activeTab={activeTab} tabs={MAIN_PAGE_TABS} />

      {activeTab === 'foundation' && (
        <Box sx={{ width: '400px' }}>
          {items.map((item) => (
            <Box key={item.id}>
              <PageCard
                coverImage={item.coverImage}
                title={item.titleData}
                updatedAt={item.updatedAt}
                editHref={item.editHref}
                editSeoHref={item.editSeoHref}
              />
            </Box>
          ))}
        </Box>
      )}

      {activeTab === 'all' && (
        <Box>
          <Typography>Тут згодом буде список усіх сторінок</Typography>
        </Box>
      )}
    </Box>
  );
}
