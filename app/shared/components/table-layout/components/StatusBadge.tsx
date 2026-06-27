'use client';

import { Box } from '@mui/material';
import React from 'react';

import TooltipCustom from '../../design-system/tooltip/Tooltip';
import { styles } from './StatusBadge.styles';
import Badge from '~/shared/components/badge/Badge';
import { BaseContentStatuses } from '~/types/enums/common.enums';

type StatusChipStatus = typeof BaseContentStatuses.Draft | typeof BaseContentStatuses.Published;
type StatusWithDateStatus = (typeof BaseContentStatuses)[keyof typeof BaseContentStatuses];

type StatusWithDateProps = Readonly<{
  status: StatusWithDateStatus;
  updatedAt?: string;
}>;

export function StatusBadge({ status, updatedAt }: StatusWithDateProps) {
  const normalizedStatus: StatusChipStatus =
    status === BaseContentStatuses.Draft ? BaseContentStatuses.Draft : BaseContentStatuses.Published;

  const badgeContent = <Badge variant={normalizedStatus} />;

  if (!updatedAt) {
    return badgeContent;
  }

  const isDraft = status === BaseContentStatuses.Draft;
  const textStatus = isDraft ? 'Редаговано' : 'Опубліковано';
  const formattedDate = new Date(updatedAt).toLocaleDateString('uk-UA');
  const tooltipTitle = `${textStatus} ${formattedDate}`;

  return (
    <TooltipCustom title={tooltipTitle} placement="top" showArrow>
      <Box sx={styles.statusBadgeContainer}>{badgeContent}</Box>
    </TooltipCustom>
  );
}
