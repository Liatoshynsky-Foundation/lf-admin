import { Box, Typography } from '@mui/material';

type GroupContentViewErrorProps = Readonly<{
  message?: string;
}>;

export const GroupContentViewError = ({ message }: GroupContentViewErrorProps) => {
  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography color="error" variant="h6">
        Помилка завантаження даних
      </Typography>
      {message && <Typography color="text.secondary">{message}</Typography>}
    </Box>
  );
};
