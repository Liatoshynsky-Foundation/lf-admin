import { fireEvent, render, screen } from '@testing-library/react';

import PageSeoPage from './page';
import { MAIN_PAGE_BASE_PATH } from '~/constants/pages';
import { usePageSeo } from '~/shared/hooks/use-page-seo/usePageSeo';

const mockPush = jest.fn();
const mockUseParams = jest.fn();

jest.mock('next/navigation', () => ({
  useParams: () => mockUseParams(),
  useRouter: () => ({ push: mockPush })
}));

jest.mock('~/shared/hooks/use-page-seo/usePageSeo', () => ({
  usePageSeo: jest.fn()
}));

jest.mock('~/shared/components/divided-header/DividedHeader', () => ({
  __esModule: true,
  default: ({
    children,
    rightActionsComponent
  }: {
    children: React.ReactNode;
    rightActionsComponent: React.ReactNode;
  }) => (
    <div data-testid="divided-header">
      {rightActionsComponent}
      {children}
    </div>
  )
}));

jest.mock('~/shared/components/divided-header/header-right-actions/HeaderRightActions', () => ({
  __esModule: true,
  default: ({ onSave, onCancel, onPublish }: { onSave: () => void; onCancel: () => void; onPublish: () => void }) => (
    <div>
      <button onClick={onSave}>save</button>
      <button onClick={onCancel}>cancel</button>
      <button onClick={onPublish}>publish</button>
    </div>
  )
}));

jest.mock('~/shared/components/divided-header/title-dropdown/TitleDropdown', () => ({
  TitleDropdown: ({ type, title }: { type: string; title: string }) => (
    <div data-testid="title-dropdown">{`${type}:${title}`}</div>
  )
}));

jest.mock('~/shared/components/forms/seo-metadata-form/seo-metadata-block/SeoMetadataBlock', () => ({
  __esModule: true,
  default: ({ value }: { value: { meta: { uk: { title: string } } } }) => (
    <div data-testid="seo-metadata-block">{value.meta.uk.title}</div>
  )
}));

const mockUsePageSeo = usePageSeo as jest.MockedFunction<typeof usePageSeo>;

const mockHandleSave = jest.fn();
const mockSetSeoValue = jest.fn();

const seoValue = {
  meta: {
    uk: { title: 'Головна', description: '', keywords: '', canonicalUrl: '' },
    en: { title: 'Main', description: '', keywords: '', canonicalUrl: '' }
  },
  ogImage: '',
  allowIndexing: { uk: true, en: true }
};

describe('PageSeoPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ slug: 'about-us' });
    mockUsePageSeo.mockReturnValue({
      seoValue,
      setSeoValue: mockSetSeoValue,
      handleSave: mockHandleSave,
      loading: false,
      pageExtraFields: jest.fn()
    } as unknown as ReturnType<typeof usePageSeo>);
  });

  it('passes the slug from params to usePageSeo', () => {
    render(<PageSeoPage />);

    expect(mockUsePageSeo).toHaveBeenCalledWith('about-us');
  });

  it('renders the uk title in the header dropdown and metadata block', () => {
    render(<PageSeoPage />);

    expect(screen.getByTestId('title-dropdown')).toHaveTextContent('SEO:Головна');
    expect(screen.getByTestId('seo-metadata-block')).toHaveTextContent('Головна');
  });

  it('saves SEO when the save action is triggered', () => {
    render(<PageSeoPage />);

    fireEvent.click(screen.getByText('save'));

    expect(mockHandleSave).toHaveBeenCalledTimes(1);
  });

  it('saves SEO when the publish action is triggered', () => {
    render(<PageSeoPage />);

    fireEvent.click(screen.getByText('publish'));

    expect(mockHandleSave).toHaveBeenCalledTimes(1);
  });

  it('navigates back to the main page on cancel', () => {
    render(<PageSeoPage />);

    fireEvent.click(screen.getByText('cancel'));

    expect(mockPush).toHaveBeenCalledWith(MAIN_PAGE_BASE_PATH);
  });
});
