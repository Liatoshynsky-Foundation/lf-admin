import { Box } from '@mui/material';

interface Props {
  params: {
    id: string;
  };
}

export default async function NewsItem({ params }: Props) {
  const { id } = params;

  return <Box>{id}</Box>;
}
