import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import React from 'react';

import { styles } from './AuthCardLayout.styles';

interface AuthCardLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export const AuthCardLayout = ({ title, subtitle, children }: AuthCardLayoutProps) => {
  return (
    <Box sx={styles.outerContainer}>
      <Box sx={styles.container}>
        <Box sx={styles.header}>
          <Box sx={styles.imageContainer}>
            <Image src="./icons/logo.svg" alt="logo" width={96} height={80} />
          </Box>

          <Box sx={styles.titleAndSubtitle}>
            <Typography sx={styles.title} variant="h6">
              {title}
            </Typography>
            <Typography sx={styles.subtitle} variant="textMd">
              {subtitle}
            </Typography>
          </Box>
        </Box>

        {children}
      </Box>
    </Box>
  );
};
