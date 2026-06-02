'use client';

import { Box, Button, Typography } from '@mui/material';
import Link from 'next/link';

import { PageHeader, PageHeaderTab } from '~/shared/components/page-header/PageHeader';

type MainPagesContentProps = Readonly<{
  activeTab: string;
}>;

const MAIN_PAGE_TABS: readonly PageHeaderTab[] = [
  { value: 'all', label: 'Всі', href: '/main-page/all' },
  { value: 'foundation', label: 'Фундація', href: '/main-page' }
];

export function MainPagesContent({ activeTab }: MainPagesContentProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <PageHeader title="Основні сторінки" activeTab={activeTab} tabs={MAIN_PAGE_TABS} />

      {activeTab === 'foundation' && (
        <Box sx={{ p: '24px' }}>
          <Typography variant="body1" sx={{ mb: '16px' }}>
            Керування сторінкою &quot;Про нас&quot;:
          </Typography>

          <Button component={Link} href="/about-us" variant="contained" color="primary">
            Перейти до редагування &quot;Про нас&quot;
          </Button>
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
