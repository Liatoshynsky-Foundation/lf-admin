import { Box, Tab, Tabs, Typography } from '@mui/material';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { mainHexPallete as colors } from '~/shared/theme/colors';

export type PageHeaderTab = Readonly<{
  value: string;
  label: string;
  href: string;
  disabled?: boolean;
}>;

type PageHeaderProps = Readonly<{
  title: string;
  action?: ReactNode;
  tabs?: ReadonlyArray<PageHeaderTab>;
  activeTab?: string;
}>;

export const PageHeader = ({ title, action, tabs, activeTab }: PageHeaderProps) => {
  const hasTabs = Boolean(tabs?.length);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap'
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontSize: '32px',
            lineHeight: 1.5,
            fontFamily: 'Mulish, sans-serif'
          }}
        >
          {title}
        </Typography>

        {action}
      </Box>

      {hasTabs ? (
        <Tabs
          value={activeTab ?? false}
          variant="scrollable"
          scrollButtons={false}
          aria-label={`${title} tabs`}
          sx={{
            minHeight: '40px',
            borderBottom: `1px solid ${colors.blue[300]}`,
            '& .MuiTabs-indicator': {
              backgroundColor: colors.black,
              height: '2px'
            }
          }}
        >
          {tabs?.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={tab.label}
              href={tab.disabled ? undefined : tab.href}
              component={tab.disabled ? 'button' : Link}
              disabled={tab.disabled}
              disableRipple
              sx={{
                textTransform: 'none',
                minHeight: '40px',
                px: '28px',
                pt: '6px',
                pb: '14px',
                fontSize: '16px',
                fontWeight: 600,
                lineHeight: 1.5,
                minWidth: '80px',
                color: colors.blue[800],
                '&.Mui-selected': {
                  color: colors.black,
                  fontWeight: 600
                }
              }}
            />
          ))}
        </Tabs>
      ) : null}
    </Box>
  );
};
