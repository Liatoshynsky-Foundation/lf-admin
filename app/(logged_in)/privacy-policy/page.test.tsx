import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import Page from './page';
import { PAGE_IDS } from '~/constants/pageBlocks';

const previewMock = jest.fn();
const saveMock = jest.fn();
const setLocaleMock = jest.fn();
const discardChangesMock = jest.fn();

jest.mock('~/shared/components/header/Header', () => ({
  Header: ({
    title,
    onPreview,
    onSave,
    onCancel,
    isSaving,
    onLanguageChange
  }: {
        title: string;
        onPreview: () => void;
        onSave: () => void;
        onCancel: () => void;
        isSaving: boolean;
        onLanguageChange: (lang: 'uk' | 'en') => void;
    }) => (
    <div data-testid="header">
      <span data-testid="title">{title}</span>
      <button data-testid="preview-btn" onClick={onPreview}>
                preview
      </button>
      <button data-testid="save-btn" onClick={onSave}>
                save
      </button>
      <button data-testid="cancel-btn" onClick={onCancel}>
                cancel
      </button>
      <span data-testid="saving-flag">{String(isSaving)}</span>
      <button data-testid="lang-en" onClick={() => onLanguageChange('en')}>
                set-en
      </button>
    </div>
  )
}));


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



jest.mock('~/store', () => ({
  useStore: (
    selector: (state: { setLocale: (l: 'uk' | 'en') => void; discardChanges: (slug: string) => void }) => unknown
  ) =>
    selector({
      setLocale: setLocaleMock,
      discardChanges: discardChangesMock
    })
}));

jest.mock('~/shared/hooks/use-page-editor/usePageEditor', () => ({
  usePageEditor: jest.fn((_slug: string) => ({
    preview: previewMock,
    loading: false
  }))
}));

jest.mock('~/shared/hooks/use-save-page/UseSavePage', () => ({
  useSavePageBlocks: jest.fn((_slug: string) => ({
    save: saveMock,
    loading: false,
    error: null,
    data: null
  }))
}));

describe('Privacy Policy Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the Privacy Policy page with all child components', () => {
    render(<Page />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('contact-us')).toBeInTheDocument();
    expect(screen.getByTestId('data-retention')).toBeInTheDocument();
    expect(screen.getByTestId('data-usage')).toBeInTheDocument();
    expect(screen.getByTestId('data-we-collect')).toBeInTheDocument();
    expect(screen.getByTestId('google-auth')).toBeInTheDocument();
    expect(screen.getByTestId('intro-section')).toBeInTheDocument();
    expect(screen.getByTestId('newsletter-subscription')).toBeInTheDocument();
    expect(screen.getByTestId('social-networks')).toBeInTheDocument();
    expect(screen.getByTestId('targeted-ads')).toBeInTheDocument();
    expect(screen.getByTestId('user-rights')).toBeInTheDocument();
    expect(screen.getByTestId('сookies')).toBeInTheDocument();
  });

  it('should call save when save button is clicked', () => {
    render(<Page />);
    fireEvent.click(screen.getByTestId('save-btn'));
    expect(saveMock).toHaveBeenCalledTimes(1);
  });

  it('should call preview when preview button is clicked', () => {
    render(<Page />);
    fireEvent.click(screen.getByTestId('preview-btn'));
    expect(previewMock).toHaveBeenCalledTimes(1);
  });

  it('should display saving flag from hooks (false by default)', () => {
    render(<Page />);
    expect(screen.getByTestId('saving-flag')).toHaveTextContent('false');
  });

  it('should display saving flag = true when editor loading is true', () => {
    const { usePageEditor } = jest.requireMock('~/shared/hooks/use-page-editor/usePageEditor') as {
            usePageEditor: jest.Mock;
        };
    usePageEditor.mockImplementationOnce((_slug: string) => ({
      preview: previewMock,
      loading: true
    }));
    render(<Page />);
    expect(screen.getByTestId('saving-flag')).toHaveTextContent('true');
  });

  it('should display saving flag = true when save loading is true', () => {
    const { useSavePageBlocks } = jest.requireMock('~/shared/hooks/use-save-page/UseSavePage') as {
            useSavePageBlocks: jest.Mock;
        };
    useSavePageBlocks.mockImplementationOnce((_slug: string) => ({
      save: saveMock,
      loading: true,
      error: null,
      data: null
    }));
    render(<Page />);
    expect(screen.getByTestId('saving-flag')).toHaveTextContent('true');
  });

  it('should call setLocale when language button is clicked', () => {
    render(<Page />);
    fireEvent.click(screen.getByTestId('lang-en'));
    expect(setLocaleMock).toHaveBeenCalledWith('en');
  });

  it('should call discardChanges with page slug when cancel button is clicked', () => {
    render(<Page />);
    fireEvent.click(screen.getByTestId('cancel-btn'));
    expect(discardChangesMock).toHaveBeenCalledWith(PAGE_IDS.PRIVACY_POLICY);
  });

  it('should call usePageEditor with PRIVACY_POLICY page id', () => {
    const { usePageEditor } = jest.requireMock('~/shared/hooks/use-page-editor/usePageEditor') as {
            usePageEditor: jest.Mock;
        };
    render(<Page />);
    expect(usePageEditor).toHaveBeenCalledWith(PAGE_IDS.PRIVACY_POLICY);
  });

  it('should call useSavePageBlocks with PRIVACY_POLICY page id', () => {
    const { useSavePageBlocks } = jest.requireMock('~/shared/hooks/use-save-page/UseSavePage') as {
            useSavePageBlocks: jest.Mock;
        };
    render(<Page />);
    expect(useSavePageBlocks).toHaveBeenCalledWith(PAGE_IDS.PRIVACY_POLICY);
  });
});
