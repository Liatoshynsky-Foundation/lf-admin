'use client';
import Menu, { type MenuProps } from '@mui/material/Menu';
import { ReactNode } from 'react';

interface DropdownMenuProps extends MenuProps {
  maxHeight?: number;
  menuList: ReactNode;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  maxHeight,
  menuList,
  sx,
  anchorOrigin = { vertical: 'top', horizontal: 'left' },
  transformOrigin = { vertical: 'top', horizontal: 'right' },
  ...props
}) => {
  return (
    <Menu
      disableRestoreFocus
      PaperProps={{ style: { maxHeight } }}
      anchorOrigin={anchorOrigin}
      transformOrigin={transformOrigin}
      sx={{ ...sx }}
      {...props}
    >
      {menuList}
    </Menu>
  );
};

export default DropdownMenu;
