import type { ElementType } from 'react';

import FacebookIcon from '~/public/icons/facebook.svg';
import InstagramIcon from '~/public/icons/instagram.svg';
import Link from '~/public/icons/link-2.svg';
import LinkedInIcon from '~/public/icons/linkedin.svg';
import TikTokIcon from '~/public/icons/tiktok.svg';
import YouTubeIcon from '~/public/icons/youtube.svg';

export type ContactsLocale = 'uk' | 'en';

export type LocalizedText = Record<ContactsLocale, string>;

export type SocialNetworkPlatform = 'instagram' | 'facebook' | 'linkedin' | 'tiktok' | 'youtube' | 'other';

export type SocialNetworkOption = {
  value: SocialNetworkPlatform;
  label: string;
  icon: ElementType;
};

export const SOCIAL_NETWORK_OPTIONS: readonly SocialNetworkOption[] = [
  { value: 'facebook', label: 'Facebook', icon: FacebookIcon },
  { value: 'instagram', label: 'Instagram', icon: InstagramIcon },
  { value: 'linkedin', label: 'LinkedIn', icon: LinkedInIcon },
  { value: 'tiktok', label: 'TikTok', icon: TikTokIcon },
  { value: 'youtube', label: 'YouTube', icon: YouTubeIcon },
  { value: 'other', label: 'Інше', icon:  Link }
];

export type SocialNetworkInput = {
  platform?: SocialNetworkPlatform;
  link: string;
};

export type SocialNetworkFormItem = SocialNetworkInput & {
  id: number;
};

export type ContactInformation = {
  name: LocalizedText;
  location: LocalizedText;
  phone: string;
  email: string;
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
