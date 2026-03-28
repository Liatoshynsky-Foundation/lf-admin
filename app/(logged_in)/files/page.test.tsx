import { render, screen } from '@testing-library/react';
import React from 'react';

import Page from './page';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt ?? ''} />
}));

jest.mock('~/shared/hooks/use-assets/useAssets', () => ({
  useAllAssets: () => ({
    data: { allAssets: [] },
    loading: false,
    error: null,
    refetch: jest.fn()
  })
}));

jest.mock('~/types/graphql/generated/graphql', () => ({
  AssetType: {
    Image: 'Image',
    Pdf: 'Pdf',
    Audio: 'Audio'
  },
  useUploadBlobMutation: () => [jest.fn()]
}));

jest.mock('~/shared/components/control-panel', () => ({
  ControlPanel: ({ leftContent, rightContent }: { leftContent: React.ReactNode; rightContent: React.ReactNode }) => (
    <div data-testid="control-panel">
      <div data-testid="left-content">{leftContent}</div>
      <div data-testid="right-content">{rightContent}</div>
    </div>
  )
}));

jest.mock('~/shared/components/dropdown-menu/DropdownMenu', () => ({
  __esModule: true,
  default: () => null
}));

jest.mock('~/shared/components/file-info-sidebar/FileInfoSidebar', () => ({
  FileInfoSidebar: () => <div data-testid="file-info-sidebar" />
}));

jest.mock('~/shared/components/files-cards-layout', () => ({
  FilesCardsLayout: () => <div data-testid="files-cards-layout" />
}));

jest.mock('~/shared/components/media-modal/MediaModal', () => ({
  MediaModal: () => null
}));

jest.mock('~/shared/components/media-modal/views/upload-view/UploadView', () => ({
  UploadView: () => null
}));

jest.mock('~/shared/components/search/Search', () => ({
  Search: () => <div data-testid="search" />
}));

jest.mock('~/shared/components/selector/FilterSelect', () => ({
  FilterSelect: () => <div data-testid="filter-select" />
}));

jest.mock('~/shared/components/selector/FilterSelectItem/FilterSelectItem', () => ({
  __esModule: true,
  default: () => null
}));

jest.mock('~/shared/components/view-toggle', () => ({
  ViewToggle: () => <div data-testid="view-toggle" />
}));

describe('Files page', () => {
  it('renders page title and upload button', () => {
    render(<Page />);

    expect(screen.getByText('Файли')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Завантажити файл/i })).toBeInTheDocument();
  });

  it('renders main files controls', () => {
    render(<Page />);

    expect(screen.getByTestId('control-panel')).toBeInTheDocument();
    expect(screen.getByTestId('files-cards-layout')).toBeInTheDocument();
    expect(screen.getByTestId('search')).toBeInTheDocument();
    expect(screen.getByTestId('view-toggle')).toBeInTheDocument();
  });
});
