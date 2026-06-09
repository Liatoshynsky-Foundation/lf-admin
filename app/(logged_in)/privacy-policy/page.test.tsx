import '@testing-library/jest-dom';

import { editPagesCommonTests } from '../__mocks__/edit-pages-factory';
import Page from './page';
import { PAGE_IDS } from '~/constants/pageBlocks';


jest.mock('~/shared/components/privacy-policy/contact-us/ContactUs', () => ({
  ContactUs: () => <div data-testid="contact-us">ContactUs</div>
}));
jest.mock('~/shared/components/privacy-policy/data-retention/DataRetention', () => ({
  DataRetention: () => <div data-testid="data-retention">DataRetention</div>
}));
jest.mock('~/shared/components/privacy-policy/data-usage/DataUsage', () => ({
  DataUsage: () => <div data-testid="data-usage">DataUsage</div>
}));
jest.mock('~/shared/components/privacy-policy/data-we-collect/DataWeCollect', () => ({
  DataWeCollect: () => <div data-testid="data-we-collect">DataWeCollect</div>
}));
jest.mock('~/shared/components/privacy-policy/google-auth/GoogleAuth', () => ({
  GoogleAuth: () => <div data-testid="google-auth">GoogleAuth</div>
}));
jest.mock('~/shared/components/privacy-policy/intro-section/IntroSection', () => ({
  IntroSection: () => <div data-testid="intro-section">IntroSection</div>
}));
jest.mock('~/shared/components/privacy-policy/newsletter-subscription/NewsletterSubscription', () => ({
  NewsletterSubscription: () => <div data-testid="newsletter-subscription">NewsletterSubscription</div>
}));
jest.mock('~/shared/components/privacy-policy/social-networks/SocialNetworks', () => ({
  SocialNetworks: () => <div data-testid="social-networks">SocialNetworks</div>
}));
jest.mock('~/shared/components/privacy-policy/targeted-ads/TargetedAds', () => ({
  TargetedAds: () => <div data-testid="targeted-ads">TargetedAds</div>
}));
jest.mock('~/shared/components/privacy-policy/user-rights/UserRights', () => ({
  UserRights: () => <div data-testid="user-rights">UserRights</div>
}));
jest.mock('~/shared/components/privacy-policy/сookies/Cookies', () => ({
  Cookies: () => <div data-testid="сookies">Cookies</div>
}));


describe('Privacy Policy', () => {
  editPagesCommonTests({
    Page,
    pageId: PAGE_IDS.PRIVACY_POLICY,
    childTestIds: [
      'contact-us',
      'data-retention',
      'data-usage',
      'data-we-collect',
      'google-auth',
      'intro-section',
      'newsletter-subscription',
      'social-networks',
      'targeted-ads',
      'user-rights',
      'сookies'
    ]
  });
});

