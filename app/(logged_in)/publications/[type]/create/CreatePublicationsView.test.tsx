import { Box, Button } from '@mui/material';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import dayjs from 'dayjs';
import React, { MouseEvent, ReactNode } from 'react';
import toast from 'react-hot-toast';

import CreatePublicationsView from './CreatePublicationsView';
import {
  CONTENT_MUTATION_RESULTS,
  initialSeoValue,
  MenuActionId,
  PAGE_TITLES,
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
    onEdit
  }: {
    onMenuOpen?: (e: MouseEvent<HTMLButtonElement>) => void;
    onPublish?: () => void;
    onEdit?: () => void;
  }) {
    return (
      <Box>
        <Button data-testid="btn-publish" onClick={onPublish}>
          Publish
        </Button>
        <Button data-testid="btn-open-menu" onClick={(e) => onMenuOpen?.(e)}>
          Menu
        </Button>
        <Button data-testid="btn-edit" onClick={onEdit}>
          Edit
        </Button>
      </Box>
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
        <Button data-testid="delete-confirm" onClick={onDelete}>
          Confirm
        </Button>
        <Button data-testid="delete-cancel" onClick={onClose}>
          Cancel
        </Button>
      </div>
    );
  };
});

jest.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: ({
    label,
    value,
    onChange
  }: {
    label: string;
    value: dayjs.Dayjs | null;
    onChange: (val: dayjs.Dayjs) => void;
  }) => (
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

const mockExtraFieldsOnChange = jest.fn();

jest.mock('~/shared/components/forms/seo-metadata-form/seo-datetime-fields/SeoDateTimeFields', () => ({
  SeoDateTimeFields: ({ onChange }: { onChange: (val: unknown) => void }) => (
    <div data-testid="mock-seo-datetime-fields">
      <Button data-testid="datetime-change" onClick={() => onChange('changed')}>
        Change
      </Button>
    </div>
  )
}));

jest.mock('~/shared/components/forms/seo-metadata-form/seo-canonicalurl-field/SeoCanonicalUrlField', () => ({
  SeoCanonicalUrlField: ({ onChange }: { onChange: (val: string) => void }) => (
    <Box data-testid="mock-seo-canonical-url-field">
      <Button data-testid="canonical-change" onClick={() => onChange('new-url')}>
        Change
      </Button>
    </Box>
  )
}));

type MockSeoBlockProps = {
  children: ReactNode;
  extraFields?: (
    locale: 'uk' | 'en',
    value: SeoBlockValue['meta']['uk'],
    onChange: (val: SeoBlockValue['meta']['uk']) => void
  ) => ReactNode;
};

jest.mock('~/shared/components/forms/seo-collapsible-block/SeoCollapsibleBlock', () => {
  return function MockSeoCollapsibleBlock({ children, extraFields }: MockSeoBlockProps) {
    const dummyValue: SeoBlockValue['meta']['uk'] = { title: '', description: '', keywords: '' };
    return (
      <Box data-testid="mock-seo-collapsible-block">
        <Box data-testid="seo-children">{children}</Box>
        <Box data-testid="seo-extra-fields">
          {extraFields ? extraFields('uk', dummyValue, mockExtraFieldsOnChange) : null}
        </Box>
      </Box>
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

    it('should render "Створення" title by default (create mode) with HeaderRightActions in create mode', () => {
      const mockData = createMockData({ publicationType: 'news' });
      render(<CreatePublicationsView data={mockData} />);
      expect(screen.getByText(`Створення ${PAGE_TITLES.news}`)).toBeInTheDocument();
      expect(screen.getByTestId('btn-edit')).toBeInTheDocument();
    });

    it('should render "Редагування" title when mode is "edit"', () => {
      const mockData = createMockData({ publicationType: 'news' });
      render(<CreatePublicationsView data={mockData} mode="edit" />);
      expect(screen.getByText(`Редагування ${PAGE_TITLES.news}`)).toBeInTheDocument();
    });

    it('should render HeaderRightActions in edit mode with publish/menu buttons for Media type', () => {
      const mockData = createMockData({ publicationType: 'media' });
      render(<CreatePublicationsView data={mockData} />);
      expect(screen.getByTestId('btn-publish')).toBeInTheDocument();
      expect(screen.getByTestId('btn-open-menu')).toBeInTheDocument();
    });

    it('should not render DividedHeader (title, edit/publish/menu buttons) when mode is "seo"', () => {
      const mockData = createMockData({ publicationType: 'news' });
      render(<CreatePublicationsView data={mockData} mode="seo" />);
      expect(screen.queryByTestId('btn-edit')).not.toBeInTheDocument();
      expect(screen.queryByTestId('btn-publish')).not.toBeInTheDocument();
      expect(screen.queryByTestId('btn-open-menu')).not.toBeInTheDocument();
      expect(screen.queryByText(new RegExp(PAGE_TITLES.news))).not.toBeInTheDocument();
      expect(screen.getByTestId('mock-seo-collapsible-block')).toBeInTheDocument();
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
      const title = 'Error Title';
      const mockData = createMockData({
        publicationType: 'news',
        adminTitleError: title
      });

      render(<CreatePublicationsView data={mockData} />);
      expect(screen.getByText(title)).toBeInTheDocument();
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

    it('should call handleDateTimeChange when SeoDateTimeFields onChange fires (Events type)', () => {
      const handleDateTimeChange = jest.fn();
      const mockData = createMockData({ publicationType: 'events', handleDateTimeChange });
      render(<CreatePublicationsView data={mockData} />);
      fireEvent.click(screen.getByTestId('datetime-change'));
      expect(handleDateTimeChange).toHaveBeenCalledWith('changed');
    });

    it('should merge canonicalUrl and call the wrapped onChange when SeoCanonicalUrlField changes (Media type)', () => {
      const mockData = createMockData({ publicationType: 'media' });
      render(<CreatePublicationsView data={mockData} />);
      fireEvent.click(screen.getByTestId('canonical-change'));
      expect(mockExtraFieldsOnChange).toHaveBeenCalledWith({
        title: '',
        description: '',
        keywords: '',
        canonicalUrl: 'new-url'
      });
    });
  });

  describe('Publish actions and toast notifications', () => {
    it('should show publicationPublished toast when media publish succeeds', async () => {
      const handleSave = jest.fn().mockResolvedValue('media-123');
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
      const handleSave = jest.fn().mockResolvedValue('media-123');
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

    it('should not toast or redirect on publish and exit when no id is returned', async () => {
      const handleSave = jest.fn().mockResolvedValue(null);
      const mockData = createMockData({ publicationType: 'media', handleSave });
      render(<CreatePublicationsView data={mockData} />);
      fireEvent.click(screen.getByTestId('btn-open-menu'));
      fireEvent.click(screen.getByText('Опублікувати і вийти'));
      await waitFor(() => {
        expect(handleSave).toHaveBeenCalledWith(BaseContentStatuses.Published);
      });
      expect(toast.success).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should show draftSaved toast and redirect on cancel publication', async () => {
      const handleSave = jest.fn().mockResolvedValue('media-123');
      const mockData = createMockData({ publicationType: 'media', handleSave });
      render(<CreatePublicationsView data={mockData} />);
      fireEvent.click(screen.getByTestId('btn-open-menu'));
      fireEvent.click(screen.getByText('Скасувати публікацію'));
      await waitFor(() => {
        expect(handleSave).toHaveBeenCalledWith(BaseContentStatuses.Draft);
        expect(toast.success).toHaveBeenCalledWith(CONTENT_MUTATION_RESULTS.draftSaved);
        expect(mockPush).toHaveBeenCalledWith(PUBLICATIONS_BASE_PATH);
      });
    });

    it('should not toast or redirect on cancel publication when no id is returned', async () => {
      const handleSave = jest.fn().mockResolvedValue(null);
      const mockData = createMockData({ publicationType: 'media', handleSave });
      render(<CreatePublicationsView data={mockData} />);
      fireEvent.click(screen.getByTestId('btn-open-menu'));
      fireEvent.click(screen.getByText('Скасувати публікацію'));
      await waitFor(() => {
        expect(handleSave).toHaveBeenCalledWith(BaseContentStatuses.Draft);
      });
      expect(toast.success).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should show an error toast and log the error when handleSave throws an Error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const handleSave = jest.fn().mockRejectedValue(new Error('Save failed'));
      const mockData = createMockData({ publicationType: 'media', handleSave });
      render(<CreatePublicationsView data={mockData} />);
      fireEvent.click(screen.getByTestId('btn-publish'));
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Помилка: Save failed');
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(`Action ${MenuActionId.PUBLISH} failed`, expect.any(Error));
      consoleErrorSpy.mockRestore();
    });

    it('should show an error toast with stringified value when handleSave rejects a non-Error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const handleSave = jest.fn().mockRejectedValue('some string error');
      const mockData = createMockData({ publicationType: 'media', handleSave });
      render(<CreatePublicationsView data={mockData} />);
      fireEvent.click(screen.getByTestId('btn-publish'));
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Помилка: some string error');
      });
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Edit action (create mode, News/Events)', () => {
    it('should call handleSave with Draft and navigate to the edit page when onEdit succeeds', async () => {
      const handleSave = jest.fn().mockResolvedValue('news-456');
      const mockData = createMockData({ publicationType: 'news', handleSave });
      render(<CreatePublicationsView data={mockData} />);
      fireEvent.click(screen.getByTestId('btn-edit'));
      await waitFor(() => {
        expect(handleSave).toHaveBeenCalledWith(BaseContentStatuses.Draft);
        expect(mockPush).toHaveBeenCalledWith(`${PUBLICATIONS_BASE_PATH}/news/news-456/edit`);
      });
    });

    it('should not navigate when onEdit save returns no id', async () => {
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

  describe('Delete flow', () => {
    it('should open the delete modal from the menu and call onDeleteConfirm on confirmation', () => {
      const onDeleteConfirm = jest.fn();
      const mockData = createMockData({ publicationType: 'media' });
      render(<CreatePublicationsView data={mockData} onDeleteConfirm={onDeleteConfirm} />);
      fireEvent.click(screen.getByTestId('btn-open-menu'));
      fireEvent.click(screen.getByText('Видалити'));
      expect(screen.getByTestId('mock-delete-modal')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('delete-confirm'));
      expect(onDeleteConfirm).toHaveBeenCalledTimes(1);
      expect(screen.queryByTestId('mock-delete-modal')).not.toBeInTheDocument();
    });

    it('should close the delete modal without calling onDeleteConfirm on cancel', () => {
      const onDeleteConfirm = jest.fn();
      const mockData = createMockData({ publicationType: 'media' });
      render(<CreatePublicationsView data={mockData} onDeleteConfirm={onDeleteConfirm} />);
      fireEvent.click(screen.getByTestId('btn-open-menu'));
      fireEvent.click(screen.getByText('Видалити'));
      fireEvent.click(screen.getByTestId('delete-cancel'));
      expect(onDeleteConfirm).not.toHaveBeenCalled();
      expect(screen.queryByTestId('mock-delete-modal')).not.toBeInTheDocument();
    });

    it('should not throw when onDeleteConfirm is not provided and delete is confirmed', () => {
      const mockData = createMockData({ publicationType: 'media' });
      render(<CreatePublicationsView data={mockData} />);
      fireEvent.click(screen.getByTestId('btn-open-menu'));
      fireEvent.click(screen.getByText('Видалити'));
      expect(() => fireEvent.click(screen.getByTestId('delete-confirm'))).not.toThrow();
      expect(screen.queryByTestId('mock-delete-modal')).not.toBeInTheDocument();
    });
  });
});
