import { Box, IconButton } from '@mui/material';
import { MoreVertical } from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';

import ActionMenu, { ActionMenuGroups } from '../../dropdown-menu/ActionMenu';
import { styles } from './ContextMenu.styles';

export function ContextMenu({
  items,
  triggerLabel
}: Readonly<{
  items: ActionMenuGroups;
  triggerLabel: string;
}>) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const handleOpen = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  return (
    <>
      <Box sx={styles.contextMenuWrapper}>
        <IconButton
          ref={triggerRef}
          onClick={handleOpen}
          aria-label={triggerLabel}
          aria-haspopup="menu"
          aria-expanded={Boolean(anchorEl)}
          sx={styles.contentMenuButton}
        >
          <MoreVertical size={22} />
        </IconButton>
      </Box>

      <ActionMenu anchorEl={anchorEl} onClose={handleClose} menuItems={items} />
    </>
  );
}
