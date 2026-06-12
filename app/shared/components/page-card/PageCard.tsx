import { Typography } from '@mui/material';
import Link from 'next/link';

import CardLayout from '../card-layout/CardLayout';
import { infoText } from '../card-layout/CardLayout.styles';
import ImageWithFallback from '../card-layout/ImageWithFallback';
import TitleWithTooltip from '../card-layout/TitleWithTooltip';
import Button from '../design-system/button/Button';
import PageCardMenuItems from './PageCardMenuItems';
import { LocalizedString } from '~/types/common';
import { formatDate } from '~/utils/formatDate';

interface PageCardProps {
  coverImage: { src: string; alt: { uk: string; en: string } };
  title: Partial<LocalizedString>;
  updatedAt?: string;
  editHref: string;
  editSeoHref: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const FALLBACK_IMAGE_SRC = '/images/image.png';

const PageCard = ({ coverImage, title, updatedAt, editHref, editSeoHref, onClick }: PageCardProps) => {
  const titleText = title.uk || title.en || '';
  const altText = coverImage.alt.uk || coverImage.alt.en || titleText;

  const coverImageNode = (
    <ImageWithFallback key={coverImage.src} src={coverImage.src} fallbackSrc={FALLBACK_IMAGE_SRC} alt={altText} />
  );

  const titleNode = <TitleWithTooltip text={titleText} />;

  const infoNode = (
    <Typography variant="caption" sx={infoText}>
      {updatedAt ? `Змінено ${formatDate(updatedAt)}` : ''}
    </Typography>
  );

  const actionButtonNode = (
    <Button
      variant="filled"
      color="primary"
      href={editHref}
      LinkComponent={editHref ? Link : undefined}
      onClick={editHref ? undefined : onClick}
    >
      {'Редагувати'}
    </Button>
  );

  const items = PageCardMenuItems({ editSeoHref });

  return (
    <CardLayout
      coverImage={coverImageNode}
      title={titleNode}
      info={infoNode}
      contentBottom={actionButtonNode}
      items={items}
    />
  );
};

export default PageCard;
