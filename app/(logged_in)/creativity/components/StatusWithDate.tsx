import { Box, Chip, Typography } from '@mui/material';
import { CircleCheckBig } from 'lucide-react';

import { formatDate } from '~/lib/utils/formatDate';
import { getStatus } from '~/lib/utils/getStatus';
import contentCardStyles from '~/shared/components/content-card/ContentCard.styles';
import contentCardBadgeStyles from '~/shared/components/content-card/ContentCardBadge.styles';
import { BaseContentStatuses } from '~/types/enums/common.enums';

type StatusChipProps = Readonly<{ status: string }>;

type StatusWithDateProps = Readonly<{
  status: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  dividerColor: string;
}>;

function StatusChip({ status }: StatusChipProps) {
  if (status === BaseContentStatuses.Published) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          color: '#2E7D32',
          fontSize: '14px',
          whiteSpace: 'nowrap'
        }}
      >
        <CircleCheckBig size={16} />
      </Box>
    );
  }

  const isDraft = status === BaseContentStatuses.Draft;
  return (
    <Chip
      label={isDraft ? 'Чернетка' : 'Редагується'}
      size="small"
      sx={{
        backgroundColor: contentCardBadgeStyles.draftBadge.backgroundColor,
        color: '#190D03',
        fontWeight: contentCardBadgeStyles.draftBadge.fontWeight,
        fontSize: contentCardBadgeStyles.draftBadge.fontSize,
        height: '24px',
        '& .MuiChip-label': {
          color: '#190D03'
        }
      }}
    />
  );
}

export function StatusWithDate({
  status,
  createdAt,
  updatedAt,
  publishedAt,
  dividerColor
}: StatusWithDateProps) {
  const normalizedStatus =
    status === BaseContentStatuses.Editing ? BaseContentStatuses.Published : status;
  const fallbackDate = updatedAt ?? publishedAt ?? createdAt;
  const statusText =
    getStatus(normalizedStatus, createdAt, updatedAt, publishedAt) ||
    (fallbackDate ? `Редаговано ${formatDate(fallbackDate)}` : '');

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        pl: '10px',
        borderLeft: `1px solid ${dividerColor}`,
        minWidth: 0
      }}
    >
      <StatusChip status={status} />
      <Typography
        variant="body2"
        sx={{
          ...contentCardStyles.date,
          fontSize: '14px',
          minWidth: 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {statusText}
      </Typography>
    </Box>
  );
}
