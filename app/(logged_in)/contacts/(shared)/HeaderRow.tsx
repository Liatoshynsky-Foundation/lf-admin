import { Box, Divider, Typography } from '@mui/material';

type HeaderRowProps = Readonly<{
  title: string;
}>;

export const HeaderRow = ({ title }: HeaderRowProps) => (
  <Box display="flex" alignItems="center" gap={'8px'}>
    <Typography
      variant="subtitle2"
      color="text.secondary"
      sx={{ fontWeight: 500, lineHeight: '130%', letterSpacing: '0.17px' }}
    >
      {title}
    </Typography>
    <Divider sx={{ flexGrow: 1 }} />
  </Box>
);
