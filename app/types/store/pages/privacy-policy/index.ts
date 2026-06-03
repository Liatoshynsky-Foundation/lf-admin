import { ContactUsBlock } from './blocks/contactUs';
import type { CookiesBlock } from './blocks/cookiesBlock';
import { DataRetentionBlock } from './blocks/dataRetention';
import type { DataUsageBlock } from './blocks/dataUsageBlock';
import type { DataWeCollectBlock } from './blocks/dataWeCollectBlock';
import { GoogleAuthBlock } from './blocks/googleAuthBlock';
import { IntroSectionBlock } from './blocks/introSection';
import { NewsletterSubscriptionBlock } from './blocks/newsletterSubscription';
import { SocialNetworksBlock } from './blocks/socialNetworksBlock';
import { TargetedAdsBlock } from './blocks/targetedAds';
import { UserRightsBlock } from './blocks/userRights';

export interface BlocksMap {
    IntroSection: IntroSectionBlock;
    DataWeCollect: DataWeCollectBlock;
    DataUsage: DataUsageBlock;
    Cookies: CookiesBlock;
    GoogleAuth: GoogleAuthBlock;
    SocialNetworks: SocialNetworksBlock;
    TargetedAds: TargetedAdsBlock;
    NewsletterSubscription: NewsletterSubscriptionBlock;
    DataRetention: DataRetentionBlock;
    UserRights: UserRightsBlock;
    ContactUs: ContactUsBlock; 
}