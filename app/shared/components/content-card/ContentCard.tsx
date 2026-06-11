import { useRouter } from 'next/navigation';
import { useState } from 'react';

import BaseCard from '../base-card/BaseCard';
import DeleteCardModal from '../delete-card-modal/DeleteCardModal';
import ContentCardBadge from './ContentCardBadge';
import ContentCardMenu from './ContentCardMenu';
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

  return (
    <BaseCard
      coverImage={coverImage}
      altText={altText}
      titleText={titleText}
      infoText={getStatus(status, createdAt, updatedAt, publishedAt)}
      badge={<ContentCardBadge type={type} status={status} localizations={localizedKeys} />}
      actionButton={{
        text: 'Редагувати',
        href: editHref,
        onClick
      }}
      modalElement={
        <DeleteCardModal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onDelete={handleDelete} />
      }
      renderMenu={(anchorEl, handleClose) => (
        <ContentCardMenu
          id={id}
          type={type}
          anchorEl={anchorEl}
          onClose={handleClose}
          setDeleteModalOpen={setDeleteModalOpen}
        />
      )}
    />
  );
};

export default ContentCard;
