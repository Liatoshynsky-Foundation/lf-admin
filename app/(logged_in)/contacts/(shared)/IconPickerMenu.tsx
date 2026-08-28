import { Box, Menu } from '@mui/material';
import { ReactNode } from 'react';

import { CircleIconButton } from './CircleIconButton';
import { useMenuScrollClose } from '~/shared/hooks/use-menu-scroll-close/useMenuScrollClose';

type IconPickerMenuProps<T> = Readonly<{
  anchorEl: HTMLElement | null;
  options: readonly T[];
  getOptionKey: (option: T) => string;
  getOptionIcon: (option: T) => ReactNode;
  onClose: () => void;
  onSelect: (option: T) => void;
}>;

export function IconPickerMenu<T>({
  anchorEl,
  options,
  getOptionKey,
  getOptionIcon,
  onClose,
  onSelect
}: IconPickerMenuProps<T>) {
  const { disableTransition, handleClose } = useMenuScrollClose({ anchorEl, onClose });

  const handleSelect = (option: T) => {
    onSelect(option);
    handleClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleClose}
      disableRestoreFocus
      disableScrollLock
      transitionDuration={disableTransition ? 0 : undefined}
    >
      <Box display="grid" gridTemplateColumns="repeat(3, 40px)" gap={1} p={'10px 16px'}>
        {options.map((option) => (
          <CircleIconButton
            key={getOptionKey(option)}
            onClick={() => handleSelect(option)}
            icon={getOptionIcon(option)}
            variant="filled"
          />
        ))}
      </Box>
    </Menu>
  );
}
