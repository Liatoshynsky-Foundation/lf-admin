'use client';
import { Typography } from '@mui/material';
import Link from 'next/link';

import CardLayout from '../card-layout/CardLayout';
import { infoText } from '../card-layout/CardLayout.styles';
import ImageWithFallback from '../card-layout/ImageWithFallback';
import TitleWithTooltip from '../card-layout/TitleWithTooltip';
import DeleteCardModal from '../delete-card-modal/DeleteCardModal';
import Button from '../design-system/button/Button';
import ContentCardBadge from './ContentCardBadge';
import ContentCardMenuItems from './ContentCardMenuItems';
import { useContentCardActions } from './useContentCardActions';
import { getStatus } from '~/lib/utils/getStatus';
import type { LocalizedString } from '~/types/common';

export type ContentType = 'news' | 'events' | 'media';

interface ContentCardImage {
  src: string;
  alt: {
    uk: string;
    en: string;
  };
}

interface ContentCardProps {
  id: string;
  type: ContentType;
  coverImage: ContentCardImage;
  title: Partial<LocalizedString>;
  status: string;
  updatedAt?: string;
  createdAt?: string;
  publishedAt?: string;
  editHref?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const ContentCard = ({
  id,
  type,
  coverImage,
  title,
  status,
  updatedAt,
  createdAt,
  publishedAt,
  editHref,
  onClick
}: ContentCardProps) => {
  const localizedKeys = Object.entries(title)
    .filter(([, value]) => Boolean(value?.trim()))
    .map(([key]) => key);
  const titleText = title.uk || title.en || '';
  const altText = coverImage.alt.uk || coverImage.alt.en || titleText;

  const { deleteModalOpen, setDeleteModalOpen, handleDelete, handlePublish, handleUnpublish, isPublished } =
    useContentCardActions({ id, type, status });

  const FALLBACK_IMAGE_SRC = 'https://pub-2b50c59c64954ab89b7837f9f4607e12.r2.dev/photos/about-us-foundation-first.png';

  const coverImageNode = (
    <ImageWithFallback key={coverImage.src} src={coverImage.src} fallbackSrc={FALLBACK_IMAGE_SRC} alt={altText} />
  );

  const titleNode = <TitleWithTooltip text={titleText} />;

  const badgeNode = <ContentCardBadge type={type} status={status} localizations={localizedKeys} />;

  const infoNode = (
    <Typography variant="caption" sx={infoText}>
      {getStatus(status, createdAt, updatedAt, publishedAt)}
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

  const itemsNode = ContentCardMenuItems({
    id,
    type,
    isPublished,
    setDeleteModalOpen,
    onUnpublish: handleUnpublish,
    onPublish: handlePublish
  });

  return (
    <>
      <CardLayout
        coverImage={coverImageNode}
        title={titleNode}
        contentUpper={badgeNode}
        info={infoNode}
        contentBottom={actionButtonNode}
        items={itemsNode}
      />

      <DeleteCardModal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onDelete={handleDelete} />
    </>
  );
};

export default ContentCard;
