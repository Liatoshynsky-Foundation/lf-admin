import { LocalizedString } from './BaseContent';

export const SOCIAL_NETWORK_PLATFORMS = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'anotherMedia', label: 'Another Media' }
] as const;

export type SocialNetworkPlatform = (typeof SOCIAL_NETWORK_PLATFORMS)[number]['value'];
export type SocialNetworkName = (typeof SOCIAL_NETWORK_PLATFORMS)[number]['label'];

export type SocialNetwork = {
	platform: SocialNetworkPlatform;
	url: string;
};

export type Contacts = {
	contactInformation: {
		foundationName: LocalizedString;
		address: LocalizedString;
		email: string;
		phone: string;
	};
	socialNetworks: SocialNetwork[];
};
