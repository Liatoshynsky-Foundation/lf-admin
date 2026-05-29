import { Box } from '@mui/material';

import Badge from '../badge/Badge';
import { ContentType } from './ContentCard';
import { styles } from './ContentCardBadge.styles';
import { BaseContentStatuses } from '~/types/enums/common.enums';
interface ContentCardBadgeProps {
  type: ContentType;
  status: string;
  localizations: Array<string>;
}

const ContentCardBadge = ({ type, status, localizations }: ContentCardBadgeProps) => {
  return (
    <Box sx={styles.badgeContainer}>
      <Badge variant={type} localizations={localizations}/>

      {status === BaseContentStatuses.Published &&
        <Badge variant='published' localizations={localizations} />
      }

      {status === BaseContentStatuses.Draft && <Badge variant='draft' localizations={localizations} /> }
    </Box>
  );
};
export default ContentCardBadge;
