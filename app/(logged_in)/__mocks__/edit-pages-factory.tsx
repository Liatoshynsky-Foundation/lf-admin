import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

const previewMock = jest.fn();
const saveMock = jest.fn();
const setLocaleMock = jest.fn();
const discardChangesMock = jest.fn();

jest.mock('~/store', () => ({
  useStore: (
    selector: (state: {
      setLocale: (l: 'uk' | 'en') => void;
      discardChanges: (slug: string) => void;
      blocksOrder: Record<string, string[]>;
      setBlocksOrder: jest.Mock;
    }) => unknown
  ) =>
    selector({
      setLocale: setLocaleMock,
      discardChanges: discardChangesMock,
      blocksOrder: {
        'about-us': ['intro', 'foundation', 'mission', 'goals', 'office', 'what-we-do', 'founders'],
        'privacy-policy': ['IntroSection', 'DataWeCollect', 'DataUsage', 'Cookies', 'GoogleAuth', 'SocialNetworks', 'TargetedAds', 'NewsletterSubscription', 'DataRetention', 'UserRights', 'ContactUs']
      },
      setBlocksOrder: jest.fn()
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
jest.mock('~/shared/components/editable-page-layout/EditablePageLayout');


interface EditPagesCommonTestsProps {
  Page: React.ElementType;
  pageId: string;
  childTestIds: string[];
}

export const editPagesCommonTests = ({ Page, pageId, childTestIds }: EditPagesCommonTestsProps) => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it(`should render the ${pageId} with all child components`, () => {
    render(<Page />);
    childTestIds.forEach((id) => {
      expect(screen.getByTestId(id)).toBeInTheDocument();
    });
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
    expect(discardChangesMock).toHaveBeenCalledWith(pageId);
  });

  it(`should call usePageEditor with ${pageId} page id`, () => {
    const { usePageEditor } = jest.requireMock('~/shared/hooks/use-page-editor/usePageEditor') as {
      usePageEditor: jest.Mock;
    };
    render(<Page />);
    expect(usePageEditor).toHaveBeenCalledWith(pageId);
  });

  it(`should call useSavePageBlocks with ${pageId} page id`, () => {
    const { useSavePageBlocks } = jest.requireMock('~/shared/hooks/use-save-page/UseSavePage') as {
      useSavePageBlocks: jest.Mock;
    };
    render(<Page />);
    expect(useSavePageBlocks).toHaveBeenCalledWith(pageId);
  });
};

