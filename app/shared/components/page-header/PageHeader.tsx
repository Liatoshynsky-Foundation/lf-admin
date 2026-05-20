import { Box, Tab, Tabs, Typography } from '@mui/material';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { styles } from './PageHeader.styles';

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
    <Box sx={styles.container}>
      <Box sx={styles.headerRow}>
        <Typography variant="h6">
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
        >
          {tabs?.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={tab.label}
              href={tab.disabled ? undefined : tab.href}
              component={tab.disabled ? 'button' : Link}
              disabled={tab.disabled}
            />
          ))}
        </Tabs>
      ) : null}
    </Box>
  );
};
