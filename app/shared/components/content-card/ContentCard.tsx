import { Box, Card, CardContent, CardMedia, Typography } from '@mui/material';
import { EllipsisVertical } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import DeleteCardModal from '../delete-card-modal/DeleteCardModal';
import Button from '../design-system/button/Button';
import styles from './ContentCard.styles';
import ContentCardBadge from './ContentCardBadge';
import ContentCardMenu from './ContentCardMenu';
import TooltipCustom from '~/ds-components/tooltip/Tooltip';
import { getStatus } from '~/lib/utils/getStatus';
import { useDeleteEvent } from '~/shared/hooks/use-events/useEvents';
import { useDeleteMediaMention } from '~/shared/hooks/use-media-mentions/useMediaMentions';
import { useDeleteNews } from '~/shared/hooks/use-news/useNews';
import type { LocalizedString } from '~/types/common';

export type ContentType = 'news' | 'events' | 'media';

const FALLBACK_IMAGE_SRC = '/images/image.png';

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
  const [imageSrc, setImageSrc] = useState(coverImage.src || FALLBACK_IMAGE_SRC);
  const localizedKeys = Object.entries(title)
    .filter(([, value]) => Boolean(value?.trim()))
    .map(([key]) => key);
  const titleText = title.uk || title.en || '';
  const altText = coverImage.alt.uk || coverImage.alt.en || titleText;

  const router = useRouter();

  const [deleteNews] = useDeleteNews();
  const [deleteEvent] = useDeleteEvent();
  const [deleteMediaMention] = useDeleteMediaMention();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const [isTitleTruncated, setIsTitleTruncated] = useState(false);

  useEffect(() => {
    const element = titleRef.current;

    if (!element) return;

    setIsTitleTruncated(element.scrollHeight > element.clientHeight);
  }, [titleText]);

  useEffect(() => {
    setImageSrc(coverImage.src || FALLBACK_IMAGE_SRC);
  }, [coverImage.src]);

  const handleImageError = () => {
    if (imageSrc !== FALLBACK_IMAGE_SRC) {
      setImageSrc(FALLBACK_IMAGE_SRC);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (!anchorEl) return;

    const handleScroll = () => {
      setAnchorEl(null);
    };

    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [anchorEl]);

  async function handleDelete() {
    try {
      let result;

      if (type === 'news') {
        result = await deleteNews({ id });
      } else if (type === 'events') {
        result = await deleteEvent({ id });
      } else if (type === 'media') {
        result = await deleteMediaMention(id);
      }

      if (result?.data) {
        setDeleteModalOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
  }

  return (
    <Card sx={styles.card}>
      <CardMedia component="img" height="148" image={imageSrc} alt={altText} onError={handleImageError} />
      <CardContent sx={styles.cardContent}>
        <ContentCardBadge type={type} status={status} localizations={localizedKeys}></ContentCardBadge>
        <Box sx={styles.mainInfo}>
          <TooltipCustom title={isTitleTruncated ? titleText : ''}>
            <Typography
              ref={titleRef}
              variant="subtitle1"
              component="h3"
              sx={styles.title}
            >
              {titleText}
            </Typography>
          </TooltipCustom>
          <Box data-testid="menu-button" sx={{ cursor: 'pointer' }} onClick={handleMenuClick}>
            <EllipsisVertical size={20} />
            {anchorEl && (
              <ContentCardMenu
                id={id}
                type={type}
                anchorEl={anchorEl}
                onClose={handleMenuClose}
                setDeleteModalOpen={setDeleteModalOpen}
              />
            )}
          </Box>
        </Box>
        <Typography variant="caption" sx={styles.date}>
          {getStatus(status, createdAt, updatedAt, publishedAt)}
        </Typography>
        <Button
          variant="filled"
          color="primary"
          href={editHref}
          LinkComponent={editHref ? Link : undefined}
          onClick={editHref ? undefined : onClick}
        >
          Редагувати
        </Button>
      </CardContent>
      <DeleteCardModal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onDelete={handleDelete} />
    </Card>
  );
};
export default ContentCard;
