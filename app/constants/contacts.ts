import type { ElementType } from 'react';

import FacebookIcon from '~/public/icons/facebook.svg';
import InstagramIcon from '~/public/icons/instagram.svg';
import Link from '~/public/icons/link-2.svg';
import LinkedInIcon from '~/public/icons/linkedin.svg';
import TikTokIcon from '~/public/icons/tiktok.svg';
import YouTubeIcon from '~/public/icons/youtube.svg';

export type ContactsLocale = 'uk' | 'en';

export type LocalizedText = Record<ContactsLocale, string>;

export type SocialNetworkPlatform = 'instagram' | 'facebook' | 'linkedin' | 'tiktok' | 'youtube' | 'anotherMedia';

export type SocialNetworkOption = {
  value: SocialNetworkPlatform;
  label: string;
  icon: ElementType;
  isSelectable?: boolean;
};

export const MAX_SOCIAL_NETWORKS_COUNT = 12;
export const ALL_SOCIAL_NETWORK_OPTIONS: readonly SocialNetworkOption[] = [
  { value: 'facebook', label: 'Facebook', icon: FacebookIcon },
  { value: 'instagram', label: 'Instagram', icon: InstagramIcon },
  { value: 'linkedin', label: 'LinkedIn', icon: LinkedInIcon, isSelectable: false },
  { value: 'tiktok', label: 'TikTok', icon: TikTokIcon, isSelectable: false },
  { value: 'youtube', label: 'YouTube', icon: YouTubeIcon },
  { value: 'anotherMedia', label: 'Universal Link', icon: Link }
];

export const SOCIAL_NETWORK_OPTIONS = ALL_SOCIAL_NETWORK_OPTIONS.filter((option) => option.isSelectable !== false);
export type SocialNetworkInput = {
  platform?: SocialNetworkPlatform;
  link: string;
};

export type SocialNetworkFormItem = SocialNetworkInput & {
  id: number;
};

export type ContactInformation = {
  foundationName: LocalizedText;
  address: LocalizedText;
  phone: string;
  email: string;
};

export const INITIAL_CONTACT_INFORMATION: ContactInformation = {
  foundationName: { uk: '', en: '' },
  address: { uk: '', en: '' },
  phone: '',
  email: ''
};

export type ContactsData = {
  contactInformation: ContactInformation;
  socialNetworks: SocialNetworkInput[];
};

export type ContactsPayload = ContactInformation & {
  socialNetworks: SocialNetworkInput[];
};

export const CONTACTS_LOADING = {
  title: 'Завантаження контактів',
  description: 'Зачекайте, поки завершиться запит.'
};
export const CONTACTS_ERROR = {
  title: 'Помилка завантаження контактів',
  description: 'Не вдалося завантажити контакти.'
};

export const INIT_LOCALE: ContactsLocale = 'uk';

export const CONTACTS_SAVE_ERROR = 'Не вдалося зберегти контакти';
export const CONTACTS_SAVE_SUCCESS = 'Контакти успішно збережено';
export const CONTACTS_VALIDATION_ERROR = 'Перевірте правильність заповнених полів';
