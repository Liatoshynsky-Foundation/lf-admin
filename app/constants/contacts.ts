import { Facebook, Instagram, YouTube } from '@mui/icons-material';
import LinkIcon from '@mui/icons-material/Link';
import type { ElementType } from 'react';

export type ContactsLocale = 'uk' | 'en';

export type LocalizedText = Record<ContactsLocale, string>;

export type SocialNetworkPlatform = 'instagram' | 'facebook' | 'youtube' | 'other';

export type SocialNetworkOption = {
  value: SocialNetworkPlatform;
  label: string;
  icon: ElementType;
};

export const SOCIAL_NETWORK_OPTIONS: readonly SocialNetworkOption[] = [
  { value: 'facebook', label: 'Facebook', icon: Facebook },
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'youtube', label: 'YouTube', icon: YouTube },
  { value: 'other', label: 'Інше', icon: LinkIcon }
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
  phone: LocalizedText;
  email: LocalizedText;
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
