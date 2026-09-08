import { LocalizedString } from './BaseContent';

export const SOCIAL_NETWORK_PLATFORMS = [
  { icon: 'facebook', platform: 'Facebook' },
  { icon: 'instagram', platform: 'Instagram' },
  { icon: 'linkedin', platform: 'LinkedIn' },
  { icon: 'tiktok', platform: 'TikTok' },
  { icon: 'youtube', platform: 'YouTube' },
  { icon: 'anotherMedia', platform: 'Another Media' }
] as const;

export type SocialNetworkIcon = (typeof SOCIAL_NETWORK_PLATFORMS)[number]['icon'];
export type SocialNetworkPlatform = (typeof SOCIAL_NETWORK_PLATFORMS)[number]['platform'];

export type SocialNetwork = {
	icon: SocialNetworkIcon;
	link: string;
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
