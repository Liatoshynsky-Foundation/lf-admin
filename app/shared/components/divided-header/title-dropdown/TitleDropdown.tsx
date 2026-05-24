'use client';

import { Box, IconButton, SxProps, Theme, Typography } from '@mui/material';
import { ChevronDown } from 'lucide-react';
import { MouseEvent } from 'react';

import { styles } from './TitleDropdown.style';
import { sxToArray } from '~/lib/utils/sxToArray';

type BaseTitleDropdownProps = {
  title: string;
  sx?: SxProps<Theme>;
  renderMenuOpen?: boolean;
  onMenuOpen?: (event: MouseEvent<HTMLElement>) => void;
};

type MultilingualProps = BaseTitleDropdownProps & {
  type: 'multilingual';
  language?: 'UA' | 'EN';
};

type SeoProps = BaseTitleDropdownProps & {
  type: 'SEO';
};

export type TitleDropdownProps = MultilingualProps | SeoProps;

export const TitleDropdown = (props: TitleDropdownProps) => {
  const { title, type, renderMenuOpen = true, onMenuOpen } = props;

  const contextLabel = type === 'multilingual' ? (props.language ?? 'UA') : 'SEO';

  return (
    <Box sx={[styles.container, ...sxToArray(props.sx)]}>
      <Typography sx={[{ maxWidth: 320 }, ...sxToArray(styles.typography)]} noWrap variant="bodyMd" title={title}>
        {title}
      </Typography>

      <Typography variant="bodyMd" sx={styles.separator}>
        /
      </Typography>

      <Typography sx={styles.typography} variant="bodyMd">{contextLabel}</Typography>
      {renderMenuOpen && (
        <IconButton aria-label="Відкрити меню" sx={styles.iconButton} onClick={onMenuOpen}>
          <ChevronDown size="20px" />
        </IconButton>
      )}
    </Box>
  );
};
