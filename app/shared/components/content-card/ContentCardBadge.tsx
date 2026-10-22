import { Box } from '@mui/material';

import Badge from '../badge/Badge';
import { ContentType } from './ContentCard';
import { styles } from './ContentCardBadge.styles';
import { BaseContentStatuses } from '~/types/enums/common.enums';

interface ContentCardBadgeProps {
  type: ContentType;
  status: string;
}

type StatusChipStatus = typeof BaseContentStatuses.Hidden | typeof BaseContentStatuses.Published;

const ContentCardBadge = ({ type, status }: ContentCardBadgeProps) => {
  const normalizedStatus: StatusChipStatus =
    status === BaseContentStatuses.Published ? BaseContentStatuses.Published : BaseContentStatuses.Hidden;

  return (
    <Box sx={styles.badgeContainer}>
      <Badge variant={type} />

      {status && <Badge variant={normalizedStatus} />}
    </Box>
  );
};

export default ContentCardBadge;
