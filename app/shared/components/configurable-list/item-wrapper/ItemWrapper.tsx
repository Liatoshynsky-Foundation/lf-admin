import { Box, IconButton } from '@mui/material';

import { styles } from './ItemWrapper.styles';
import TrashIcon from '~/public/icons/trash.svg';

interface ItemWrapperProps {
  editable: boolean;
  onDelete: () => void;
  withSeparator?: boolean;
  children: React.ReactNode;
}

const separator = <Box sx={styles.separator} role="presentation" />;

const ItemWrapper: React.FC<ItemWrapperProps> = ({ editable, withSeparator = true, onDelete, children }) => {
  return (
    <>
      <Box sx={styles.itemWrapper}>
        <Box sx={styles.wrapperContent}>{children}</Box>
        <IconButton size="small" onClick={onDelete} sx={styles.trashIcon(editable)}>
          <TrashIcon />
        </IconButton>
      </Box>
      {withSeparator && separator}
    </>
  );
};

export default ItemWrapper;
