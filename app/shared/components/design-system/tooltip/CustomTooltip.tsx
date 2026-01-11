import { Tooltip, TooltipProps } from '@mui/material';

import { customTooltipStyles } from './CustomTooltip.styles';

type CustomTooltipProps = Readonly<Omit<TooltipProps, 'arrow' | 'slotProps'>>;

export function CustomTooltip({ placement = 'top', ...props }: CustomTooltipProps) {
  return <Tooltip arrow placement={placement} slotProps={{ tooltip: customTooltipStyles.tooltip }} {...props} />;
}
