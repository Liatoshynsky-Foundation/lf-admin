import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import dayjs from 'dayjs';
import React, { MouseEvent, ReactNode } from 'react';
import toast from 'react-hot-toast';

import CreatePublicationsView from './CreatePublicationsView';
import {
  CONTENT_MUTATION_RESULTS,
  initialSeoValue,
  PUBLICATIONS_BASE_PATH,
  PublicationsItemType
} from '~/constants/publications';
import type { SeoBlockValue } from '~/shared/components/forms/seo-metadata-form/seo-metadata-block/SeoMetadataBlock';
import { useUpsertPublication } from '~/shared/hooks/use-upsert-publication/useUpsertPublication';
import { BaseContentStatuses } from '~/types/enums/common.enums';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: mockPush })),
  usePathname: jest.fn(() => '/publications/news/create')
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn()
}));

jest.mock('~/shared/hooks/use-navigation-guard/useNavigationGuard', () => ({
  useNavigationGuard: jest.fn(() => ({ navigateBack: jest.fn() }))
}));

jest.mock('~/shared/hooks/use-unsaved-changes/useUnsavedChanges', () => ({
  useUnsavedChanges: jest.fn()
}));

jest.mock('~/shared/components/divided-header/header-right-actions/HeaderRightActions', () => {
  return function MockHeaderRightActions({
    onMenuOpen,
    onPublish,
    onPreview
  }: {
    onMenuOpen?: (e: MouseEvent<HTMLButtonElement>) => void;
    onPublish?: () => void;
    onPreview?: () => void;
  }) {
    return (
      <div>
        <button data-testid='btn-preview' onClick={onPreview}>Preview</button>
        <button data-testid="btn-publish" onClick={onPublish}>
          Publish
        </button>
        <button data-testid="btn-open-menu" onClick={(e) => onMenuOpen?.(e)}>
          Menu
        </button>
      </div>
    );
  };
});

jest.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: ({ label, value, onChange }: { label: string; value: any; onChange: (val: any) => void }) => (
    <div data-testid="mock-date-picker">
      <label>{label}</label>
      <input
        type="text"
        data-testid="date-picker-input"
        value={value ? value.toISOString() : ''}
        onChange={(e) => onChange(dayjs(e.target.value))}
      />
    </div>
  )
}));

jest.mock('@mui/x-date-pickers/LocalizationProvider', () => ({
  LocalizationProvider: ({ children }: { children: ReactNode }) => <div>{children}</div>
}));

jest.mock('~/shared/components/forms/seo-metadata-form/seo-datetime-fields/SeoDateTimeFields', () => ({
  SeoDateTimeFields: () => <div data-testid="mock-seo-datetime-fields" />
}));

jest.mock('~/shared/components/forms/seo-metadata-form/seo-canonicalurl-field/SeoCanonicalUrlField', () => ({
  SeoCanonicalUrlField: () => <div data-testid="mock-seo-canonical-url-field" />
}));

type MockSeoBlockProps = {
  children: ReactNode;
  extraFields?: (locale: 'uk' | 'en', value: SeoBlockValue['meta']['uk'], onChange: () => void) => ReactNode;
};

jest.mock('~/shared/components/forms/seo-collapsible-block/SeoCollapsibleBlock', () => {
  return function MockSeoCollapsibleBlock({ children, extraFields }: MockSeoBlockProps) {
    const dummyValue: SeoBlockValue['meta']['uk'] = { title: '', description: '', keywords: '' };

    return (
      <div data-testid="mock-seo-collapsible-block">
        <div data-testid="seo-children">{children}</div>

        <div data-testid="seo-extra-fields">{extraFields ? extraFields('uk', dummyValue, jest.fn()) : null}</div>
      </div>
    );
  };
});

const createMockData = (
  overrides: Partial<ReturnType<typeof useUpsertPublication>> = {}
): ReturnType<typeof useUpsertPublication> => ({
  isEditing: false,
  isLoading: false,
  isValidType: true,
  publicationType: 'news' as PublicationsItemType,
  pageTitle: 'Створення Новини',
  adminTitle: '',
  setAdminTitle: jest.fn(),
  adminTitleError: '',
  setAdminTitleError: jest.fn(),
  publishDate: null,
  setPublishDate: jest.fn(),
  seoValue: initialSeoValue,
  setSeoValue: jest.fn(),
  crop: null,
  setCrop: jest.fn(),
  forceShowErrors: false,
  handleSave: jest.fn(),
  handleDateTimeChange: jest.fn(),
  hasUnsavedChanges: false,
  ...overrides
});

describe('CreatePublicationsView Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering by Publication Type', () => {
    it('should render correctly for News (no extra SEO fields)', () => {
      const mockData = createMockData({ publicationType: 'news' });
      render(<CreatePublicationsView data={mockData} />);

      expect(screen.getByLabelText('Назва новини в адмінці')).toBeInTheDocument();

      expect(screen.getByTestId('mock-date-picker')).toBeInTheDocument();

      expect(screen.queryByTestId('mock-seo-datetime-fields')).not.toBeInTheDocument();
      expect(screen.queryByTestId('mock-seo-canonical-url-field')).not.toBeInTheDocument();
    });

    it('should render correctly for Events (includes DateTime fields)', () => {
      const mockData = createMockData({ publicationType: 'events' });
      render(<CreatePublicationsView data={mockData} />);

      expect(screen.getByLabelText('Назва події в адмінці')).toBeInTheDocument();
      expect(screen.getByTestId('mock-seo-datetime-fields')).toBeInTheDocument();
    });

    it('should render correctly for Media (includes Canonical URL field)', () => {
      const mockData = createMockData({ publicationType: 'media' });
      render(<CreatePublicationsView data={mockData} />);

      expect(screen.getByLabelText('Назва публікації в адмінці')).toBeInTheDocument();
      expect(screen.getByTestId('mock-seo-canonical-url-field')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call setAdminTitle & convert a text to uppercase when the admin title input changes', () => {
      const mockSetAdminTitle = jest.fn();
      const mockData = createMockData({
        publicationType: 'news',
        setAdminTitle: mockSetAdminTitle
      });
      const title = 'New Test Title';

      render(<CreatePublicationsView data={mockData} />);

      const input = screen.getByLabelText('Назва новини в адмінці');
      fireEvent.change(input, { target: { value: title } });

      expect(mockSetAdminTitle).toHaveBeenCalledTimes(1);
      expect(mockSetAdminTitle).toHaveBeenCalledWith(title.toUpperCase());
    });

    it('should display an error message on the admin title field if adminTitleError is present', () => {
      const mockData = createMockData({
        publicationType: 'news',
        adminTitleError: 'Обов\'язкове поле'
      });

      render(<CreatePublicationsView data={mockData} />);
      expect(screen.getByText('Обов\'язкове поле')).toBeInTheDocument();
    });

    it('should call setPublishDate when the date picker value changes', () => {
      const mockSetPublishDate = jest.fn();
      const mockData = createMockData({
        publicationType: 'news',
        setPublishDate: mockSetPublishDate
      });

      render(<CreatePublicationsView data={mockData} />);
      const dateInput = screen.getByTestId('date-picker-input');
      fireEvent.change(dateInput, { target: { value: '2024-05-10T10:00:00Z' } });
      expect(mockSetPublishDate).toHaveBeenCalledTimes(1);

      const passedValue = mockSetPublishDate.mock.calls[0][0] as dayjs.Dayjs;
      expect(dayjs.isDayjs(passedValue)).toBe(true);
      expect(passedValue.toISOString()).toBe('2024-05-10T10:00:00.000Z');
    });

    it('should trigger onPreview when a eye icon is clicked', () => {
      const mockOnPreview = jest.fn();
      const mockData = createMockData({
        publicationType: 'news',
      });
      render(<CreatePublicationsView data={mockData} onPreview={mockOnPreview} />);

      fireEvent.click(screen.getByTestId('btn-preview'));

      expect(mockOnPreview).toHaveBeenCalledTimes(1);
    });
  });

  describe('Publish actions and toast notifications', () => {
    it('should show publicationPublished toast when media publish succeeds', async () => {
      const handleSave = jest.fn().mockResolvedValue({ id: 'media-123' });
      const mockData = createMockData({ publicationType: 'media', handleSave });

      render(<CreatePublicationsView data={mockData} />);
      fireEvent.click(screen.getByTestId('btn-publish'));

      await waitFor(() => {
        expect(handleSave).toHaveBeenCalledWith(BaseContentStatuses.Published);
        expect(toast.success).toHaveBeenCalledWith(CONTENT_MUTATION_RESULTS.publicationPublished);
      });
    });

    it('should not show toast when media publish returns no id', async () => {
      const handleSave = jest.fn().mockResolvedValue(null);
      const mockData = createMockData({ publicationType: 'media', handleSave });

      render(<CreatePublicationsView data={mockData} />);
      fireEvent.click(screen.getByTestId('btn-publish'));

      await waitFor(() => {
        expect(handleSave).toHaveBeenCalledWith(BaseContentStatuses.Published);
      });
      expect(toast.success).not.toHaveBeenCalled();
    });

    it('should show publicationPublished toast and redirect on publish and exit', async () => {
      const handleSave = jest.fn().mockResolvedValue({ id: 'media-123' });
      const mockData = createMockData({ publicationType: 'media', handleSave });

      render(<CreatePublicationsView data={mockData} />);
      fireEvent.click(screen.getByTestId('btn-open-menu'));
      fireEvent.click(screen.getByText('Опублікувати і вийти'));

      await waitFor(() => {
        expect(handleSave).toHaveBeenCalledWith(BaseContentStatuses.Published);
        expect(toast.success).toHaveBeenCalledWith(CONTENT_MUTATION_RESULTS.publicationPublished);
        expect(mockPush).toHaveBeenCalledWith(PUBLICATIONS_BASE_PATH);
      });
    });
  });
});
