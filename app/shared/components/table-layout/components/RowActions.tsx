import { Box } from '@mui/material';
import React from 'react';

import { ActionMenuGroups } from '../../dropdown-menu/ActionMenu';
import { ContextMenu } from './ContextMenu';
import { EditAction } from './EditAction';
import { styles } from './RowActions.styles';

type RowActionsProps = Readonly<{
  editAction?: { editHref?: string; editLabel: string; onEditClick?: () => void };
  menuActions?: { menuItems: ActionMenuGroups; menuTriggerLabel: string };
}>;

export function RowActions({ editAction, menuActions }: RowActionsProps) {
  if (!editAction && !menuActions) return null;

  return (
    <Box sx={styles.rowActionsCell}>
      {editAction && (
        <EditAction href={editAction.editHref} label={editAction.editLabel} onClick={editAction.onEditClick} />
      )}
      {menuActions && <ContextMenu items={menuActions.menuItems} triggerLabel={menuActions.menuTriggerLabel} />}
    </Box>
  );
}
