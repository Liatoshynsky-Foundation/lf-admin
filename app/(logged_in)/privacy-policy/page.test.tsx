import '@testing-library/jest-dom';

import { editPagesCommonTests } from '../__mocks__/edit-pages-factory';
import Page from './page';
import { PAGE_IDS } from '~/constants/pageBlocks';


jest.mock('~/shared/components/privacy-policy/contact-us/ContactUs', () => ({
  ContactUs: () => <div data-testid="ContactUs">ContactUs</div>
}));
jest.mock('~/shared/components/privacy-policy/data-retention/DataRetention', () => ({
  DataRetention: () => <div data-testid="DataRetention">DataRetention</div>
}));
jest.mock('~/shared/components/privacy-policy/data-usage/DataUsage', () => ({
  DataUsage: () => <div data-testid="DataUsage">DataUsage</div>
}));
jest.mock('~/shared/components/privacy-policy/data-we-collect/DataWeCollect', () => ({
  DataWeCollect: () => <div data-testid="DataWeCollect">DataWeCollect</div>
}));
jest.mock('~/shared/components/privacy-policy/google-auth/GoogleAuth', () => ({
  GoogleAuth: () => <div data-testid="GoogleAuth">GoogleAuth</div>
}));
jest.mock('~/shared/components/privacy-policy/intro-section/IntroSection', () => ({
  IntroSection: () => <div data-testid="IntroSection">IntroSection</div>
}));
jest.mock('~/shared/components/privacy-policy/newsletter-subscription/NewsletterSubscription', () => ({
  NewsletterSubscription: () => <div data-testid="NewsletterSubscription">NewsletterSubscription</div>
}));
jest.mock('~/shared/components/privacy-policy/social-networks/SocialNetworks', () => ({
  SocialNetworks: () => <div data-testid="SocialNetworks">SocialNetworks</div>
}));
jest.mock('~/shared/components/privacy-policy/targeted-ads/TargetedAds', () => ({
  TargetedAds: () => <div data-testid="TargetedAds">TargetedAds</div>
}));
jest.mock('~/shared/components/privacy-policy/user-rights/UserRights', () => ({
  UserRights: () => <div data-testid="UserRights">UserRights</div>
}));
jest.mock('~/shared/components/privacy-policy/cookies/Cookies', () => ({
  Cookies: () => <div data-testid="Cookies">Cookies</div>
}));

jest.mock('~/shared/components/sortable-list/SortableList');


describe('Privacy Policy', () => {
  editPagesCommonTests({
    Page,
    pageId: PAGE_IDS.PRIVACY_POLICY,
    childTestIds: [
      'IntroSection',
      'ContactUs',
      'DataRetention',
      'DataUsage',
      'DataWeCollect',
      'GoogleAuth',
      'NewsletterSubscription',
      'SocialNetworks',
      'TargetedAds',
      'UserRights',
      'Cookies'
    ],
    expectedReorderedBlocks: ['IntroSection', 'GoogleAuth', 'DataUsage']
  });
});

