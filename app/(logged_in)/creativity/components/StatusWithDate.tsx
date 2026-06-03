import { Box, Typography } from '@mui/material';

import { formatDate } from '~/lib/utils/formatDate';
import Badge from '~/shared/components/badge/Badge';
import contentCardStyles from '~/shared/components/content-card/ContentCard.styles';
import { BaseContentStatuses } from '~/types/enums/common.enums';

type StatusChipStatus = typeof BaseContentStatuses.Draft | typeof BaseContentStatuses.Published;
type StatusWithDateStatus = typeof BaseContentStatuses[keyof typeof BaseContentStatuses];

type StatusWithDateProps = Readonly<{
  status: StatusWithDateStatus;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  dividerColor: string;
}>;


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
      <Badge variant={normalizedStatus}/>
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
