'use client';

import { Box, IconButton, Typography } from '@mui/material';
import { ChevronDown } from 'lucide-react';
import { MouseEvent } from 'react';

type BaseTitleDropdownProps = {
  title: string;
  onMenuOpen: (event: MouseEvent<HTMLElement>) => void;
};

type MultilingualProps = BaseTitleDropdownProps & {
  type?: 'multilingual';
  language?: 'UA' | 'EN';
};

type SeoProps = BaseTitleDropdownProps & {
  type?: 'SEO';
};

export type TitleDropdownProps = MultilingualProps | SeoProps;

export const TitleDropdown = (props: TitleDropdownProps) => {
  const { title, type, onMenuOpen } = props;

  const contextLabel = type === 'multilingual' ? props.language ?? 'UA' : 'SEO';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, whiteSpace: 'nowrap' }}>
      <Typography sx={{width: 320}} noWrap variant="customBold20Tight" title={title}>
        {title}
      </Typography>

      <Typography variant="customBold20Tight" sx={{ color: '#9D9FA9' }}>
        /
      </Typography>

      <Typography variant="customBold20Tight">{contextLabel}</Typography>
      <IconButton aria-label="Відкрити меню" sx={{ml: '-4px'}} onClick={onMenuOpen}>
        <ChevronDown size="20px" color="#190D03" strokeWidth="1.5px" />
      </IconButton>
    </Box>
  );
};
