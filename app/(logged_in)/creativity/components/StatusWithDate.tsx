import { Box, Typography } from '@mui/material';

import { getStatusWithDateWrapper, styles } from './StatusWithDate.styles';
import { formatDate } from '~/lib/utils/formatDate';
import Badge from '~/shared/components/badge/Badge';
import { BaseContentStatuses } from '~/types/enums/common.enums';

type StatusChipStatus = typeof BaseContentStatuses.Draft | typeof BaseContentStatuses.Published;
type StatusWithDateStatus = (typeof BaseContentStatuses)[keyof typeof BaseContentStatuses];

type StatusWithDateProps = Readonly<{
  status: StatusWithDateStatus;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  dividerColor: string;
}>;

export function StatusWithDate({ status, createdAt, updatedAt, publishedAt, dividerColor }: StatusWithDateProps) {
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
    <Box sx={getStatusWithDateWrapper(dividerColor)}>
      <Badge variant={normalizedStatus} />
      {statusText && (
        <Typography variant="body2" sx={styles.statusText}>
          {statusText}
        </Typography>
      )}
    </Box>
  );
}
