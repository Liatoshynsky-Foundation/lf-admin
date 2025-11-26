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
            backgroundColor: '#FFE099',
            color: '#190D03',
            '&:hover': {
              backgroundColor: '#FFE099'
            }
          })
        }}
      >
        {icon}
      </IconButton>
    </span>
  </Tooltip>
);
