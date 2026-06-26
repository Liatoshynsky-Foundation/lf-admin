import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import OpusView from './OpusView';
import { initialOpusDetails, initialOpusSeoValue } from '~/constants/opus';
import { useUpsertOpus } from '~/shared/hooks/use-upsert-opus/useUpsertOpus';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: mockPush }))
}));

const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: (msg: string) => mockToastSuccess(msg),
    error: (msg: string) => mockToastError(msg)
  }
}));

jest.mock('~/shared/components/forms/seo-metadata-form/seo-metadata-block/SeoMetadataBlock', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-seo-metadata-block" />
}));

jest.mock('~/shared/components/media-modal/MediaModal', () => ({
  MediaModal: () => null
}));

const createMockData = (
  overrides: Partial<ReturnType<typeof useUpsertOpus>> = {}
): ReturnType<typeof useUpsertOpus> => ({
  isEditing: false,
  isLoading: false,
  details: initialOpusDetails,
  setDetails: jest.fn(),
  detailsErrors: { number: '', name: '', creationYear: '', genre: '' },
  seoValue: initialOpusSeoValue,
  setSeoValue: jest.fn(),
  crop: null,
  setCrop: jest.fn(),
  forceShowErrors: false,
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

  it('renders the edit title in edit mode', () => {
    render(<OpusView data={createMockData({ isEditing: true })} mode="edit" />);

    expect(screen.getByText('Редагування опусу')).toBeInTheDocument();
  });

  it('saves and redirects to the group edit page on successful create', async () => {
    const handleSave = jest.fn().mockResolvedValue('new-opus-id');
    render(<OpusView data={createMockData({ handleSave })} mode="create" />);

    fireEvent.click(screen.getByRole('button', { name: 'Перейти до редагування' }));

    await waitFor(() => {
      expect(handleSave).toHaveBeenCalled();
      expect(mockToastSuccess).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/creativity/group/new-opus-id/edit');
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
});
