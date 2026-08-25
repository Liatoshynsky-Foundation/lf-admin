import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';

import OpusView from './OpusView';
import { initialOpusDetails, initialOpusSeoValue } from '~/constants/opus';
import { useUpsertOpus } from '~/shared/hooks/use-upsert-opus/useUpsertOpus';

interface MockSeoMetadataBlockProps {
  onChangeCrop: (
    newCrop: {
      uk: { x: number; y: number; width: number; height: number } | null;
    } | null
  ) => void;
  required?: boolean;
}

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: mockPush }))
}));

const mockSeoMetadataRequired = jest.fn();

jest.mock('~/shared/components/forms/seo-metadata-form/seo-metadata-block/SeoMetadataBlock', () => ({
  __esModule: true,
  default: ({ onChangeCrop, required }: MockSeoMetadataBlockProps) => {
    mockSeoMetadataRequired(required);
    return (
      <div data-testid="mock-seo-metadata-block">
        <button
          data-testid="mock-change-crop-btn"
          onClick={() => onChangeCrop({ uk: { x: 0, y: 0, width: 100, height: 100 } })}
        >
        Change Crop
        </button>
        <button data-testid="mock-change-crop-null-btn" onClick={() => onChangeCrop(null)}>
        Change Crop Null
        </button>
      </div>
    );
  }
}));

jest.mock('~/shared/components/media-modal/MediaModal', () => ({
  MediaModal: () => null
}));

jest.mock('@mui/x-date-pickers/LocalizationProvider', () => ({
  LocalizationProvider: ({ children }: { children: ReactNode }) => <>{children}</>
}));

jest.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: ({ label }: { label: string }) => <input aria-label={label} readOnly value="" />
}));

const createMockData = (
  overrides: Partial<ReturnType<typeof useUpsertOpus>> = {}
): ReturnType<typeof useUpsertOpus> => ({
  isEditing: false,
  isLoading: false,
  details: initialOpusDetails,
  setDetails: jest.fn(),
  detailsErrors: { number: '', name: '', creationYear: '' },
  compositionErrors: {},
  seoValue: initialOpusSeoValue,
  setSeoValue: jest.fn(),
  crop: null,
  setCrop: jest.fn(),
  isSaved: false,
  handleSave: jest.fn(),
  ...overrides
});

describe('OpusView Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the create title and details fields', () => {
    render(<OpusView data={createMockData()} mode="create" />);

    expect(screen.getByText('Створення опусу')).toBeInTheDocument();
    expect(screen.getByText('Деталі')).toBeInTheDocument();
    expect(screen.getByLabelText('Назва опусу *')).toBeInTheDocument();
  });

  it('makes SEO metadata optional for opus create and edit forms', () => {
    render(<OpusView data={createMockData()} mode="create" />);

    expect(mockSeoMetadataRequired).toHaveBeenCalledWith(false);
  });

  it('renders the edit title in edit mode', () => {
    render(<OpusView data={createMockData({ isEditing: true })} mode="edit" />);

    expect(screen.getByText('Редагування опусу')).toBeInTheDocument();
  });

  it('saves and redirects to the advanced content editor on successful create', async () => {
    const handleSave = jest.fn().mockResolvedValue('new-opus-id');
    render(<OpusView data={createMockData({ handleSave })} mode="create" />);

    fireEvent.click(screen.getByRole('button', { name: 'Перейти до редагування' }));

    await waitFor(() => {
      expect(handleSave).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/creativity/group/new-opus-id/content?from=create');
    });
  });

  it('saves and redirects to the advanced content editor on successful edit', async () => {
    const handleSave = jest.fn().mockResolvedValue('existing-opus-id');
    render(<OpusView data={createMockData({ isEditing: true, handleSave })} mode="edit" />);

    fireEvent.click(screen.getByRole('button', { name: 'Перейти до редагування' }));

    await waitFor(() => {
      expect(handleSave).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/creativity/group/existing-opus-id/content?from=edit');
    });
  });

  it('does not redirect when save returns no id (validation failed)', async () => {
    const handleSave = jest.fn().mockResolvedValue(undefined);
    render(<OpusView data={createMockData({ handleSave })} mode="create" />);

    fireEvent.click(screen.getByRole('button', { name: 'Перейти до редагування' }));

    await waitFor(() => {
      expect(handleSave).toHaveBeenCalled();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('does not redirect when save returns no id after an error', async () => {
    const handleSave = jest.fn().mockResolvedValue(undefined);
    render(<OpusView data={createMockData({ handleSave })} mode="create" />);

    fireEvent.click(screen.getByRole('button', { name: 'Перейти до редагування' }));

    await waitFor(() => {
      expect(handleSave).toHaveBeenCalled();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('does not redirect when save returns no id after validation failure', async () => {
    const handleSave = jest.fn().mockResolvedValue(undefined);
    render(<OpusView data={createMockData({ handleSave })} mode="create" />);

    fireEvent.click(screen.getByRole('button', { name: 'Перейти до редагування' }));

    await waitFor(() => {
      expect(handleSave).toHaveBeenCalled();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('calls setCrop with new crop data when onChangeCrop is triggered', () => {
    const setCropMock = jest.fn();
    render(<OpusView data={createMockData({ setCrop: setCropMock })} mode="create" />);

    fireEvent.click(screen.getByTestId('mock-change-crop-btn'));

    expect(setCropMock).toHaveBeenCalledWith({ x: 0, y: 0, width: 100, height: 100 });
  });

  it('calls setCrop with null when onChangeCrop is triggered without uk crop', () => {
    const setCropMock = jest.fn();
    render(<OpusView data={createMockData({ setCrop: setCropMock })} mode="create" />);
    fireEvent.click(screen.getByTestId('mock-change-crop-null-btn'));

    expect(setCropMock).toHaveBeenCalledWith(null);
  });

  it('uses default "create" mode when mode prop is not explicitly provided', () => {
    render(<OpusView data={createMockData()} />);

    expect(screen.getByText('Створення опусу')).toBeInTheDocument();
  });
});
