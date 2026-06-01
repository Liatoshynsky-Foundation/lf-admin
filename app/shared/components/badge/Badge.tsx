import { Box } from '@mui/material';
import { CircleCheckBig } from 'lucide-react';
import { ReactElement } from 'react';

import styles from './Badge.styles';
import { getLocalizations } from '~/lib/utils/localizations';

export type BadgeVariant = 'published' | 'draft' | 'news' | 'events' | 'media'

type BadgeProps = {
  variant: BadgeVariant;
  label?: string;
  sx?: object;
  localizations?: Array<string>
}

const iconMapping: Record<BadgeVariant, ReactElement<SVGSVGElement> | null> = {
  published: <CircleCheckBig size={16} />,
  draft: null,
  news: null,
  events: null,
  media: null,
};

const labelMapping: Record<BadgeVariant, string | null> = {
  published: null,
  draft: 'Чернетка',
  news: 'Новина',
  events: 'Подія',
  media: 'Ми у ЗМІ',
};

const Badge = ({ variant, label, sx, localizations=['uk', 'en'] }: BadgeProps) => {
  const localizationLabel = getLocalizations(localizations);
  const hasLocalizationLabel = Boolean(localizationLabel);
  const hasLabel = hasLocalizationLabel || Boolean(label) || Boolean(labelMapping[variant]);

  return (
    <Box
      data-testid="badge"
      sx={{ ...styles.typeBadge(variant, hasLabel), ...styles[variant], ...sx }}
    >
      {iconMapping[variant] ?? iconMapping[variant]}
      {
        (label || labelMapping[variant]) && (
          <Box>{label ?? labelMapping[variant]}</Box>
        )
      }
      {localizationLabel && <Box>{localizationLabel}</Box>}</Box>
  );
};


export default Badge;
