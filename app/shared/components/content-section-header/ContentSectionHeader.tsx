import { Box, Divider, Typography } from '@mui/material';

import { styles } from './ContentSectionHeader.styles';

export type ContentSectionHeaderProps = Readonly<{ title: string }>;

export const ContentSectionHeader = ({ title }: ContentSectionHeaderProps) => (
  <Box sx={styles.container}>
    <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
    <Divider sx={styles.divider} />
  </Box>
);
