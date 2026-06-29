import { render, screen } from '@testing-library/react';
import React from 'react';

import { MainPagesContent } from './MainPageContent';
import { PageCategory } from '~/types/enums/common.enums';
import { useGetPagesQuery } from '~/types/graphql/generated/graphql';

jest.mock('~/types/graphql/generated/graphql', () => ({
  useGetPagesQuery: jest.fn(),
}));

jest.mock('~/shared/components/page-header/PageHeader', () => ({
  PageHeader: jest.fn(({ title, activeTab, tabs }) => (
    <div data-testid="mock-page-header" data-active-tab={activeTab}>
      <h2>{title}</h2>
      <div data-testid="mock-tabs">{JSON.stringify(tabs)}</div>
    </div>
  )),
}));

jest.mock('~/shared/components/cards-grid/CardsGrid', () => ({
  __esModule: true,
  default: jest.fn(({ children, columns }) => (
    <div data-testid="mock-cards-grid" data-columns={JSON.stringify(columns)}>
      {children}
    </div>
  )),
}));

jest.mock('~/shared/components/page-card/PageCard', () => ({
  __esModule: true,
  default: jest.fn(({ coverImage, title, updatedAt, editHref, editSeoHref }) => (
    <div data-testid="mock-page-card" data-title={title}>
      <h3>{title}</h3>
      <span>{coverImage}</span>
      <span>{updatedAt}</span>
      <span>{editHref}</span>
      <span>{editSeoHref}</span>
    </div>
  )),
}));

describe('MainPagesContent Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return null if loading is true', () => {
    (useGetPagesQuery as jest.Mock).mockReturnValue({
      loading: true,
      data: undefined,
    });

    const { container } = render(<MainPagesContent activeTab="all" />);
    expect(container.firstChild).toBeNull();
  });

  it('should return null if data is not present (undefined)', () => {
    (useGetPagesQuery as jest.Mock).mockReturnValue({
      loading: false,
      data: undefined,
    });

    const { container } = render(<MainPagesContent activeTab="all" />);
    expect(container.firstChild).toBeNull();
  });

  it('should display only pages with allowed slugs ("about-us", "privacy-policy")', () => {
    const mockPages = [
      { id: '1', slug: 'about-us', title: 'About Us', coverImage: 'img1.png', updatedAt: '2026-06-23' },
      { id: '2', slug: 'privacy-policy', title: 'Privacy Policy', coverImage: 'img2.png', updatedAt: '2026-06-23' },
      { id: '3', slug: 'home', title: 'Home Page', coverImage: 'img3.png', updatedAt: '2026-06-23' },
      { id: '4', slug: 'contact', title: 'Contact Us', coverImage: 'img4.png', updatedAt: '2026-06-23' },
    ];

    (useGetPagesQuery as jest.Mock).mockReturnValue({
      loading: false,
      data: { pages: mockPages },
    });

    render(<MainPagesContent activeTab="all" />);

    const cards = screen.getAllByTestId('mock-page-card');
    expect(cards).toHaveLength(2);

    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();

    expect(screen.queryByText('Home Page')).not.toBeInTheDocument();
    expect(screen.queryByText('Contact Us')).not.toBeInTheDocument();
  });

  it('should render the PageHeader, CardsGrid, and PageCard with correct props', () => {
    const mockPages = [
      { id: '1', slug: 'about-us', title: 'About Us', coverImage: 'img1.png', updatedAt: '2026-06-23' },
    ];

    (useGetPagesQuery as jest.Mock).mockReturnValue({
      loading: false,
      data: { pages: mockPages },
    });

    render(<MainPagesContent activeTab={PageCategory.Foundation} />);

    const header = screen.getByTestId('mock-page-header');
    expect(header).toBeInTheDocument();
    expect(screen.getByText('Основні сторінки')).toBeInTheDocument();
    expect(header).toHaveAttribute('data-active-tab', 'foundation');
    
    const tabsElement = screen.getByTestId('mock-tabs');
    expect(tabsElement).toBeInTheDocument();
    const tabsContent = JSON.parse(tabsElement.textContent);
    expect(tabsContent).toEqual([
      { value: 'all', label: 'Всі', href: '/main-page' },
      { value: 'foundation', label: 'Фундація', href: '/main-page/foundation' },
      { value: 'other', label: 'Інші', href: '/main-page/other' },
    ]);

    const grid = screen.getByTestId('mock-cards-grid');
    expect(grid).toBeInTheDocument();

    const card = screen.getByTestId('mock-page-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveAttribute('data-title', 'About Us');

    expect(screen.getByText('img1.png')).toBeInTheDocument();
    expect(screen.getByText('2026-06-23')).toBeInTheDocument();
  });

  it('should call useGetPagesQuery with correct variables', () => {
    (useGetPagesQuery as jest.Mock).mockReturnValue({
      loading: false,
      data: { pages: [] },
    });

    render(<MainPagesContent activeTab="all" />);
    expect(useGetPagesQuery).toHaveBeenLastCalledWith({
      variables: { category: undefined }
    });

    render(<MainPagesContent activeTab={PageCategory.Foundation} />);
    expect(useGetPagesQuery).toHaveBeenLastCalledWith({
      variables: { category: PageCategory.Foundation }
    });
  });

  it('should render PageCard with editHref always pointing to /slug', () => {
    const mockPages = [
      { id: '1', slug: 'about-us', title: 'About Us', coverImage: 'img1.png', updatedAt: '2026-06-23' },
      { id: '2', slug: 'privacy-policy', title: 'Privacy Policy', coverImage: 'img2.png', updatedAt: '2026-06-23' },
    ];

    (useGetPagesQuery as jest.Mock).mockReturnValue({
      loading: false,
      data: { pages: mockPages },
    });

    render(<MainPagesContent activeTab="all" />);

    const cards = screen.getAllByTestId('mock-page-card');
    expect(cards).toHaveLength(2);

    expect(screen.getByText('/about-us')).toBeInTheDocument();
    expect(screen.getByText('/privacy-policy')).toBeInTheDocument();
  });
});
