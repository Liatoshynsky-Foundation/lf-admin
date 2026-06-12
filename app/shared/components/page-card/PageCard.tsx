import BaseCard from '../base-card/BaseCard';
import BaseCardMenu from '../base-card/BaseCardMenu';
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

const PageCard = ({ coverImage, title, updatedAt, editHref, editSeoHref, onClick }: PageCardProps) => {
  const titleText = title.uk || title.en || '';
  const altText = coverImage.alt.uk || coverImage.alt.en || titleText;

  return (
    <BaseCard
      coverImage={{
        src: coverImage.src,
        alt: { uk: coverImage.alt.uk, en: coverImage.alt.en }
      }}
      altText={altText}
      titleText={titleText}
      infoText={updatedAt ? `Змінено ${formatDate(updatedAt)}` : ''}
      actionButton={{
        text: 'Редагувати',
        href: editHref,
        onClick: onClick
      }}
      renderMenu={(anchorEl, handleClose, direction) => (
        <BaseCardMenu
          anchorEl={anchorEl}
          onClose={handleClose}
          menuItems={PageCardMenuItems({ editSeoHref })}
          menuDirection={direction}
        />
      )}
    />
  );
};

export default PageCard;
