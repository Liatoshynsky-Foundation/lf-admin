import { PublicationsItemType } from '~/constants/publications';

export const getPreviewSlug = ({
  publicationType,
  dbSlug
}: {
  publicationType: PublicationsItemType;
  dbSlug: string;
}) => {
  if (publicationType === 'media') return '/news?tab=press';
  return `${publicationType}/${dbSlug}`;
};
