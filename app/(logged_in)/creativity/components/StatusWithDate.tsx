import { Box, Chip, Typography } from '@mui/material';
import { CircleCheckBig } from 'lucide-react';

import { formatDate } from '~/lib/utils/formatDate';
import contentCardStyles from '~/shared/components/content-card/ContentCard.styles';
import contentCardBadgeStyles from '~/shared/components/content-card/ContentCardBadge.styles';
import { BaseContentStatuses } from '~/types/enums/common.enums';

type StatusChipStatus = typeof BaseContentStatuses.Draft | typeof BaseContentStatuses.Published;
type StatusWithDateStatus = typeof BaseContentStatuses[keyof typeof BaseContentStatuses];

type StatusChipProps = Readonly<{ status: StatusChipStatus }>;

type StatusWithDateProps = Readonly<{
  status: StatusWithDateStatus;
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
          width: '24px',
          height: '24px',
          borderRadius: '12px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#2E7D32',
          color: '#FFFFFF',
          flexShrink: 0
        }}
      >
        <CircleCheckBig size={14} />
      </Box>
    );
  }

  return (
    <Chip
      label="Чернетка"
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
  const normalizedStatus: StatusChipStatus =
    status === BaseContentStatuses.Draft ? BaseContentStatuses.Draft : BaseContentStatuses.Published;

  const statusText = (() => {
    if (normalizedStatus === BaseContentStatuses.Published) {
      const publishedDate = publishedAt ?? updatedAt ?? createdAt;
      return publishedDate ? `Опубліковано ${formatDate(publishedDate)}` : 'Опубліковано';
    }

    if (updatedAt && (!createdAt || updatedAt !== createdAt)) {
      return `Редаговано ${formatDate(updatedAt)}`;
    }

    return createdAt ? `Створено ${formatDate(createdAt)}` : '';
  })();

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
        pr: '4px',
        borderLeft: `1px solid ${dividerColor}`,
        minWidth: 0
      }}
    >
      <StatusChip status={normalizedStatus} />
      {statusText && (
        <Typography
          variant="body2"
          sx={{
            ...contentCardStyles.date,
            fontSize: '14px',
            fontStyle: 'italic',
            mt: 0,
            minWidth: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {statusText}
        </Typography>
      )}
    </Box>
  );
}
