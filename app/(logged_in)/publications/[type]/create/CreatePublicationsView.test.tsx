import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import dayjs from 'dayjs';
import React, { MouseEvent, ReactNode } from 'react';
import toast from 'react-hot-toast';

import CreatePublicationsView from './CreatePublicationsView';
import {
  CONTENT_MUTATION_RESULTS,
  initialSeoValue,
  MENU_ACTION_CONFIGS,
  MenuActionId,
  PUBLICATIONS_BASE_PATH,
  PublicationsItemType
} from '~/constants/publications';
import { fetchPreview } from '~/lib/utils/fetchPreview';
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
    onPreview,
    onEdit
  }: {
    onMenuOpen?: (e: MouseEvent<HTMLButtonElement>) => void;
    onPublish?: () => void;
    onPreview?: () => void;
    onEdit?: () => void;
  }) {
    return (
      <div>
        <button data-testid="btn-preview" onClick={onPreview}>Preview</button>
        <button data-testid="btn-publish" onClick={onPublish}>
          Publish
        </button>
        <button data-testid="btn-open-menu" onClick={(e) => onMenuOpen?.(e)}>
          Menu
        </button>
        {onEdit && (
          <button data-testid="btn-edit" onClick={onEdit}>
            Edit
          </button>
        )}
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
  SeoCanonicalUrlField: ({
    value,
    onChange,
    onBlur
  }: {
    value: string;
    onChange: (val: string) => void;
    onBlur?: () => void;
  }) => (
    <div data-testid="mock-seo-canonical-url-field">
      <input
        data-testid="canonical-url-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      />
    </div>
  )
}));

type MockSeoBlockProps = {
  children: ReactNode;
  extraFields?: (
    locale: 'uk' | 'en',
    value: SeoBlockValue['meta']['uk'],
    onChange: (val: SeoBlockValue['meta']['uk']) => void
  ) => ReactNode;
  value?: any;
  onChange?: (val: any) => void;
};

jest.mock('~/shared/components/forms/seo-collapsible-block/SeoCollapsibleBlock', () => {
  return function MockSeoCollapsibleBlock({ children, extraFields, value, onChange }: MockSeoBlockProps) {
    const dummyValue = value?.meta?.uk || { title: '', description: '', keywords: '' };

    return (
      <div data-testid="mock-seo-collapsible-block">
        <div data-testid="seo-children">{children}</div>

        <div data-testid="seo-extra-fields">
          {extraFields && onChange
            ? extraFields('uk', dummyValue, (val) =>
              onChange({
                ...value,
                meta: {
                  ...value.meta,
                  uk: val
                }
              })
            )
            : null}
        </div>
      </div>
    );
  };
});

jest.mock('~/components/delete-card-modal/DeleteCardModal', () => {
  return function MockDeleteCardModal({
    open,
    onClose,
    onDelete
  }: {
    open: boolean;
    onClose: () => void;
    onDelete: () => void;
  }) {
    if (!open) return null;
    return (
      <div data-testid="mock-delete-modal">
        <button data-testid="btn-close-delete-modal" onClick={onClose}>Close</button>
        <button data-testid="btn-confirm-delete-modal" onClick={onDelete}>Delete</button>
      </div>
    );
  };
});

jest.mock('~/lib/utils/fetchPreview', () => ({
  fetchPreview: jest.fn().mockResolvedValue(undefined)
}));

jest.mock('~/lib/utils/getPreviewSlug', () => ({
  getPreviewSlug: jest.fn(({ dbSlug }) => `/preview/${dbSlug}`)
}));

const createMockData = (
  overrides: Partial<ReturnType<typeof useUpsertPublication>> = {}
): ReturnType<typeof useUpsertPublication> => ({
  isEditing: false,
  isLoading: false,
  isValidType: true,
  canonicalUrlError: '',
  setCanonicalUrlError: jest.fn(),
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

const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

describe('CreatePublicationsView Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    errorSpy.mockClear();
  });

  afterAll(() => {
    errorSpy.mockRestore();
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

  describe('Rendering by Mode', () => {
    it('should render correct title in edit mode', () => {
      const mockData = createMockData({ publicationType: 'news' });
      render(<CreatePublicationsView data={mockData} mode="edit" />);
      expect(screen.getByText('Редагування Новини')).toBeInTheDocument();
    });

    it('should render correct title in create mode', () => {
      const mockData = createMockData({ publicationType: 'news' });
      render(<CreatePublicationsView data={mockData} mode="create" />);
      expect(screen.getByText('Створення Новини')).toBeInTheDocument();
    });

    it('should not render DividedHeader in seo mode', () => {
      const mockData = createMockData({ publicationType: 'news' });
      render(<CreatePublicationsView data={mockData} mode="seo" />);
      expect(screen.queryByText('Створення Новини')).not.toBeInTheDocument();
      expect(screen.queryByText('Редагування Новини')).not.toBeInTheDocument();
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

    it('should show toast.error when media publish returns no id', async () => {
      const handleSave = jest.fn().mockResolvedValue(null);
      const mockData = createMockData({ publicationType: 'media', handleSave });

      render(<CreatePublicationsView data={mockData} />);
      fireEvent.click(screen.getByTestId('btn-publish'));

      await waitFor(() => {
        expect(handleSave).toHaveBeenCalledWith(BaseContentStatuses.Published);
      });
      expect(toast.error).toHaveBeenCalledWith(MENU_ACTION_CONFIGS.PUBLISH.toastErrorMessage);
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

  describe('SEO Canonical URL Field (Line 92)', () => {
    it('should call setSeoValue when Canonical URL input changes', () => {
      const mockSetSeoValue = jest.fn();
      const mockData = createMockData({
        publicationType: 'media',
        seoValue: {
          ...initialSeoValue,
          meta: {
            ...initialSeoValue.meta,
            uk: { ...initialSeoValue.meta.uk, canonicalUrl: 'http://old.url' }
          }
        },
        setSeoValue: mockSetSeoValue
      });

      render(<CreatePublicationsView data={mockData} />);

      const input = screen.getByTestId('canonical-url-input');
      fireEvent.change(input, { target: { value: 'http://new.url' } });
      fireEvent.blur(input);

      expect(mockSetSeoValue).toHaveBeenCalledTimes(1);
      expect(mockSetSeoValue).toHaveBeenCalledWith(
        expect.objectContaining({
          meta: expect.objectContaining({
            uk: expect.objectContaining({
              canonicalUrl: 'http://new.url'
            })
          })
        })
      );
    });
  });

  describe('Preview actions (fallbackOnPreview, Lines 111-128)', () => {
    let originalConsoleError: typeof console.error;

    beforeAll(() => {
      originalConsoleError = console.error;
      console.error = jest.fn();
    });

    afterAll(() => {
      console.error = originalConsoleError;
    });

    it('should show error toast if handleSave returns null/undefined', async () => {
      const handleSave = jest.fn().mockResolvedValue(null);
      const mockData = createMockData({ publicationType: 'news', handleSave });

      render(<CreatePublicationsView data={mockData} />);
      fireEvent.click(screen.getByTestId('btn-preview'));

      await waitFor(() => {
        expect(handleSave).toHaveBeenCalledWith(BaseContentStatuses.Draft);
        expect(toast.error).toHaveBeenCalledWith('Виникла помилка при отриманні даних для попереднього перегляду');
        expect(console.error).toHaveBeenCalled();
      });
    });

    it('should show error toast if handleSave returns object with missing id or slug', async () => {
      const handleSave = jest.fn().mockResolvedValue({ id: '', slug: '' });
      const mockData = createMockData({ publicationType: 'news', handleSave });

      render(<CreatePublicationsView data={mockData} />);
      fireEvent.click(screen.getByTestId('btn-preview'));

      await waitFor(() => {
        expect(handleSave).toHaveBeenCalledWith(BaseContentStatuses.Draft);
        expect(toast.error).toHaveBeenCalledWith('Виникла помилка при отриманні даних для попереднього перегляду');
        expect(console.error).toHaveBeenCalled();
      });
    });

    it('should call fetchPreview with locale "uk" if seoValue.meta.uk.title is populated', async () => {
      const handleSave = jest.fn().mockResolvedValue({ id: '123', slug: 'news-slug' });
      const seoValue = {
        ...initialSeoValue,
        meta: {
          ...initialSeoValue.meta,
          uk: { ...initialSeoValue.meta.uk, title: 'Ukrainian Title' }
        }
      };
      const mockData = createMockData({ publicationType: 'news', handleSave, seoValue });

      render(<CreatePublicationsView data={mockData} />);
      fireEvent.click(screen.getByTestId('btn-preview'));

      await waitFor(() => {
        expect(handleSave).toHaveBeenCalledWith(BaseContentStatuses.Draft);
        expect(fetchPreview).toHaveBeenCalledWith({
          slug: '/preview/news-slug',
          lang: 'uk',
          draftId: '123'
        });
      });
    });

    it('should call fetchPreview with locale "en" if seoValue.meta.uk.title is empty', async () => {
      const handleSave = jest.fn().mockResolvedValue({ id: '123', slug: 'news-slug' });
      const seoValue = {
        ...initialSeoValue,
        meta: {
          ...initialSeoValue.meta,
          uk: { ...initialSeoValue.meta.uk, title: '' }
        }
      };
      const mockData = createMockData({ publicationType: 'news', handleSave, seoValue });

      render(<CreatePublicationsView data={mockData} />);
      fireEvent.click(screen.getByTestId('btn-preview'));

      await waitFor(() => {
        expect(handleSave).toHaveBeenCalledWith(BaseContentStatuses.Draft);
        expect(fetchPreview).toHaveBeenCalledWith({
          slug: '/preview/news-slug',
          lang: 'en',
          draftId: '123'
        });
      });
    });
  });

  describe('Menu actions', () => {
    it('should show toast.error and not redirect on publish and exit when no id is returned', async () => {
      const handleSave = jest.fn().mockResolvedValue(null);
      const mockData = createMockData({ publicationType: 'media', handleSave });
      render(<CreatePublicationsView data={mockData} />);
      fireEvent.click(screen.getByTestId('btn-open-menu'));
      fireEvent.click(screen.getByText('Опублікувати і вийти'));
      await waitFor(() => {
        expect(handleSave).toHaveBeenCalledWith(BaseContentStatuses.Published);
      });
      expect(toast.error).toHaveBeenCalledWith(MENU_ACTION_CONFIGS.PUBLICATE_AND_EXIT.toastErrorMessage);
      expect(toast.success).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should show publication unpublished toast and redirect on cancel publication', async () => {
      const handleSave = jest.fn().mockResolvedValue('media-123');
      const mockData = createMockData({ publicationType: 'media', handleSave });

      render(<CreatePublicationsView data={mockData} />);
      fireEvent.click(screen.getByTestId('btn-open-menu'));
      fireEvent.click(screen.getByText('Скасувати публікацію'));

      await waitFor(() => {
        expect(handleSave).toHaveBeenCalledWith(BaseContentStatuses.Draft);
        expect(toast.success).toHaveBeenCalledWith(CONTENT_MUTATION_RESULTS.publicationUnpublished);
        expect(mockPush).toHaveBeenCalledWith(PUBLICATIONS_BASE_PATH);
      });
    });

    it('should show toast.error and not redirect on cancel publication when no id is returned', async () => {
      const handleSave = jest.fn().mockResolvedValue(null);
      const mockData = createMockData({ publicationType: 'media', handleSave });
      render(<CreatePublicationsView data={mockData} />);
      fireEvent.click(screen.getByTestId('btn-open-menu'));
      fireEvent.click(screen.getByText('Скасувати публікацію'));
      await waitFor(() => {
        expect(handleSave).toHaveBeenCalledWith(BaseContentStatuses.Draft);
      });
      expect(toast.error).toHaveBeenCalledWith(MENU_ACTION_CONFIGS.CANCEL_PUBLICATION.toastErrorMessage);
      expect(toast.success).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it('should handle error when action fails with string error', async () => {
    const errorMsg = 'Unexpected string error';
    const handleSave = jest.fn().mockRejectedValue(errorMsg);
    const mockData = createMockData({ publicationType: 'media', handleSave });

    render(<CreatePublicationsView data={mockData} />);
    fireEvent.click(screen.getByTestId('btn-publish'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(`Помилка: ${errorMsg}`);
      expect(console.error).toHaveBeenCalledWith(`Action ${MenuActionId.PUBLISH} failed`, errorMsg);
    });
  });


  describe('onEdit action', () => {
    it('should save draft and redirect to edit page when edit button is clicked', async () => {
      const handleSave = jest.fn().mockResolvedValue({ id: 'news-456' });
      const mockData = createMockData({ publicationType: 'news', handleSave });

      render(<CreatePublicationsView data={mockData} />);
      fireEvent.click(screen.getByTestId('btn-edit'));

      await waitFor(() => {
        expect(handleSave).toHaveBeenCalledWith(BaseContentStatuses.Draft);
        expect(mockPush).toHaveBeenCalledWith(`${PUBLICATIONS_BASE_PATH}/news/news-456/edit`);
      });
    });

    it('should not redirect if handleSave returns no ID during edit', async () => {
      const handleSave = jest.fn().mockResolvedValue(null);
      const mockData = createMockData({ publicationType: 'news', handleSave });

      render(<CreatePublicationsView data={mockData} />);
      fireEvent.click(screen.getByTestId('btn-edit'));

      await waitFor(() => {
        expect(handleSave).toHaveBeenCalledWith(BaseContentStatuses.Draft);
      });
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Delete actions ', () => {
    it('should open delete modal, and call onDeleteConfirm on confirm', async () => {
      const mockOnDeleteConfirm = jest.fn();
      const mockData = createMockData({ publicationType: 'media' });

      render(<CreatePublicationsView data={mockData} onDeleteConfirm={mockOnDeleteConfirm} />);

      expect(screen.queryByTestId('mock-delete-modal')).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId('btn-open-menu'));
      fireEvent.click(screen.getByText('Видалити'));

      expect(screen.getByTestId('mock-delete-modal')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('btn-confirm-delete-modal'));

      expect(mockOnDeleteConfirm).toHaveBeenCalledTimes(1);
      expect(screen.queryByTestId('mock-delete-modal')).not.toBeInTheDocument();
    });

    it('should close delete modal without calling onDeleteConfirm on close', async () => {
      const mockOnDeleteConfirm = jest.fn();
      const mockData = createMockData({ publicationType: 'media' });

      render(<CreatePublicationsView data={mockData} onDeleteConfirm={mockOnDeleteConfirm} />);

      fireEvent.click(screen.getByTestId('btn-open-menu'));
      fireEvent.click(screen.getByText('Видалити'));

      expect(screen.getByTestId('mock-delete-modal')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('btn-close-delete-modal'));

      expect(mockOnDeleteConfirm).not.toHaveBeenCalled();
      expect(screen.queryByTestId('mock-delete-modal')).not.toBeInTheDocument();
    });
  });
});

