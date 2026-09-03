import { isValidUrl } from './isValidUrl';
import { PublicationsItemType } from '~/constants/publications';
import type { SeoBlockValue } from '~/shared/components/forms/seo-metadata-form/seo-metadata-block/SeoMetadataBlock';
import { validateSeoField } from '~/shared/components/forms/seo-metadata-form/validateSeoField';

export const checkIsSeoInvalid = (
  ukMeta: SeoBlockValue['meta']['uk'],
  enMeta: SeoBlockValue['meta']['en'],
  publicationType: PublicationsItemType,
  ticketUrl: SeoBlockValue['ticketUrl'],
  ogImage?: string | null
): boolean => {
  if (!ukMeta.title.trim() || !enMeta.title.trim()) return true;
  if (!ukMeta.description.trim() || !enMeta.description.trim()) return true;

  if (ogImage) {
    const ukAlt = ukMeta.altText?.uk ?? '';
    const enAlt = enMeta.altText?.en ?? '';
    if (validateSeoField('altText', ukAlt, { required: true })) return true;
    if (validateSeoField('altText', enAlt, { required: true })) return true;
  }

  if (publicationType === 'media') {
    const ukUrl = ukMeta.canonicalUrl ?? '';
    const enUrl = enMeta.canonicalUrl ?? '';
    return !ukUrl.trim() || !enUrl.trim() || !isValidUrl(ukUrl) || !isValidUrl(enUrl);
  }
  if (publicationType === 'events') {
    const ukUrl = ticketUrl?.uk ?? '';
    const enUrl = ticketUrl?.en ?? '';
    return !ukUrl.trim() || !enUrl.trim() || !isValidUrl(ukUrl) || !isValidUrl(enUrl);
  }
  return false;
};
