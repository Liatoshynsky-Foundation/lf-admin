import BaseCard from '../base-card/BaseCard';
import PageCardMenu from './PageCardMenu';
import { formatDate } from '~/lib/utils/formatDate';
import type { LocalizedString } from '~/types/common';

interface PageCardProps {
  coverImage: { src: string; alt: { uk: string; en: string } };
  title: Partial<LocalizedString>;
  updatedAt?: string;
  editHref: string;
  editSeoHref: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const PageCard = ({ coverImage, title, updatedAt, editHref, editSeoHref, onClick }: PageCardProps) => {
  const titleText = title.uk || title.en || '';
  const altText = coverImage.alt.uk || coverImage.alt.en || titleText;

  return (
    <BaseCard
      coverImage={coverImage}
      altText={altText}
      titleText={titleText}
      infoText={updatedAt ? `Змінено ${formatDate(updatedAt)}` : ''}
      actionButton={{
        text: 'Редагувати',
        href: editHref,
        onClick: onClick
      }}
      renderMenu={(anchorEl, handleClose) => (
        <PageCardMenu anchorEl={anchorEl} onClose={handleClose} editSeoHref={editSeoHref} />
      )}
    />
  );
};

export default PageCard;
