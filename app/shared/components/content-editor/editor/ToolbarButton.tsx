import { IconButton, Tooltip } from '@mui/material';

import { ToolbarButtonProps } from '../types';

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({ onClick, isActive, disabled, icon, label }) => (
  <Tooltip title={label} arrow>
    <span>
      <IconButton
        onClick={onClick}
        disabled={disabled}
        size="small"
        color={isActive ? 'primary' : 'default'}
        sx={{
          minWidth: '32px',
          height: '32px',
          borderRadius: 1,
          ...(isActive && {
            backgroundColor: 'primary.light',
            '&:hover': {
              backgroundColor: 'primary.main'
            }
          })
        }}
      >
        {icon}
      </IconButton>
    </span>
  </Tooltip>
);
