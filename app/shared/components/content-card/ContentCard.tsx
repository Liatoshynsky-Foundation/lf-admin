'use client';
import { Typography } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import CardLayout from '../cards-layout/CardLayout';
import { infoText } from '../cards-layout/CardLayout.styles';
import ImageWithFallback from '../cards-layout/ImageWithFallback';
import TitleWithTooltip from '../cards-layout/TitleWithTooltip';
import DeleteCardModal from '../delete-card-modal/DeleteCardModal';
import Button from '../design-system/button/Button';
import ContentCardBadge from './ContentCardBadge';
import ContentCardMenuItems from './ContentCardMenuItems';
import { getStatus } from '~/lib/utils/getStatus';
import { useDeleteEvent } from '~/shared/hooks/use-events/useEvents';
import { useDeleteMediaMention } from '~/shared/hooks/use-media-mentions/useMediaMentions';
import { useDeleteNews } from '~/shared/hooks/use-news/useNews';
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

  const router = useRouter();

  const [deleteNews] = useDeleteNews();
  const [deleteEvent] = useDeleteEvent();
  const [deleteMediaMention] = useDeleteMediaMention();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const FALLBACK_IMAGE_SRC = '/images/image.png';

  async function handleDelete() {
    try {
      let result;
      if (type === 'news') result = await deleteNews({ id });
      else if (type === 'events') result = await deleteEvent({ id });
      else if (type === 'media') result = await deleteMediaMention(id);

      if (result?.data) {
        setDeleteModalOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
  }

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

  const items = ContentCardMenuItems({ id, type, setDeleteModalOpen });

  return (
    <>
      <CardLayout
        coverImage={coverImageNode}
        title={titleNode}
        contentUpper={badgeNode}
        info={infoNode}
        contentBottom={actionButtonNode}
        items={items}
      />

      <DeleteCardModal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onDelete={handleDelete} />
    </>
  );
};

export default ContentCard;
