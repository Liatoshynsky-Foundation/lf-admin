'use client';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Box, Button,Typography } from '@mui/material';
import Link from 'next/link';

import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import CollapsibleBlock from '~/shared/components/design-system/collapsible-block/CollapsibleBlock';
import { EditBlockSkeleton } from '~/shared/components/edit-block-skeleton/EditBlockSkeleton';
import { usePageBlock } from '~/shared/hooks/use-page-block/usePageBlock';

export const MusicTableSection = () => {
  const pageId = PAGE_IDS.ARTISTRY;
  const blockId = BLOCK_IDS.MUSIC_TABLE;

  const { block } = usePageBlock(pageId, blockId);

  if (!block) return <EditBlockSkeleton />;

  return (
    <CollapsibleBlock title="Таблиця музичних творів">
      <Box
        sx={{
          p: 2,
          mt: 1,
          backgroundColor: 'action.hover',
          borderRadius: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Цей блок динамічно завантажує таблицю композицій з бази даних. Додавання та редагування самих музичних творів відбувається у відповідному розділі адмін-панелі.
        </Typography>

        <Box>
          <Button
            component={Link}
            href="/creativity"
            variant="outlined"
            color="primary"
            size="small"
            endIcon={<ArrowForwardIcon />}
          >
            Перейти до управління творами
          </Button>
        </Box>
      </Box>
    </CollapsibleBlock>
  );
};
