import { fireEvent, render, screen } from '@testing-library/react';
import React, { ChangeEvent } from 'react';

import { PerformanceRow, PerformanceRowProps } from './PerformanceRow';
import type { NormalizedGroupPerformance } from '~/constants/creativity';

const LABELS = {
  canonicalUrl: 'Canonical URL',
  caption: 'Підпис',
  deleteButton: 'Видалити'
};

const MOCK_IDS = {
  base: '1',
  missingCaption: '3'
};

const MOCK_URLS = {
  base: 'https://youtube.com/watch?v=123',
  new: 'https://new-link.com',
  noProtocol: 'example.com/video',
  missingCaption: 'https://youtube.com',
  testUndefined: 'https://test.com',
  testUndefinedNew: 'https://test.com/new'
};

const MOCK_CAPTIONS = {
  uk: 'Перший виступ',
  en: 'First performance',
  updated: 'Оновлений підпис',
  testUndefinedUk: 'Тест',
  testUndefinedEn: 'Test',
  testUndefinedNew: 'Новий підпис'
};

const LANGUAGES = {
  uk: 'uk' as const,
  en: 'en' as const
};

type MockCustomTextFieldProps = {
  label: string;
  value?: unknown;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
};

jest.mock('~/shared/components/design-system/text-field/TextField', () => ({
  CustomTextField: ({ label, value, onChange }: MockCustomTextFieldProps) => (
    <div data-testid={`mock-field-wrapper-${label}`}>
      <label htmlFor={`input-${label}`}>{label}</label>
      <input
        id={`input-${label}`}
        data-testid={`mock-input-${label}`}
        value={(value as string) || ''}
        onChange={onChange}
      />
    </div>
  )
}));

const mockOnUpdateUrl = jest.fn();
const mockOnUpdateCaption = jest.fn();
const mockOnDeleteRequest = jest.fn();
const mockRenderLinkPreview = jest.fn(() => <span data-testid="mock-link-preview" />);

const baseItem: NormalizedGroupPerformance = {
  id: MOCK_IDS.base,
  url: MOCK_URLS.base,
  caption: { uk: MOCK_CAPTIONS.uk, en: MOCK_CAPTIONS.en }
};

const renderRow = (overrides: Partial<PerformanceRowProps> = {}) => {
  const props: PerformanceRowProps = {
    item: baseItem,
    langKey: LANGUAGES.uk,
    renderLinkPreview: mockRenderLinkPreview,
    onUpdateUrl: mockOnUpdateUrl,
    onUpdateCaption: mockOnUpdateCaption,
    onDeleteRequest: mockOnDeleteRequest,
    ...overrides
  };
  return render(<PerformanceRow {...props} />);
};

describe('PerformanceRow Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render url and caption for the given langKey', () => {
    renderRow();

    expect(screen.getByTestId(`mock-input-${LABELS.canonicalUrl}`)).toHaveValue(MOCK_URLS.base);
    expect(screen.getByTestId(`mock-input-${LABELS.caption}`)).toHaveValue(MOCK_CAPTIONS.uk);
  });

  it('should render caption for "en" langKey', () => {
    renderRow({ langKey: LANGUAGES.en });

    expect(screen.getByTestId(`mock-input-${LABELS.caption}`)).toHaveValue(MOCK_CAPTIONS.en);
  });

  it('should call onUpdateUrl with item id and new value', () => {
    renderRow();

    fireEvent.change(screen.getByTestId(`mock-input-${LABELS.canonicalUrl}`), {
      target: { value: MOCK_URLS.new }
    });

    expect(mockOnUpdateUrl).toHaveBeenCalledTimes(1);
    expect(mockOnUpdateUrl).toHaveBeenCalledWith(MOCK_IDS.base, MOCK_URLS.new);
  });

  it('should call onUpdateCaption with item id and new value', () => {
    renderRow();

    fireEvent.change(screen.getByTestId(`mock-input-${LABELS.caption}`), {
      target: { value: MOCK_CAPTIONS.updated }
    });

    expect(mockOnUpdateCaption).toHaveBeenCalledTimes(1);
    expect(mockOnUpdateCaption).toHaveBeenCalledWith(MOCK_IDS.base, MOCK_CAPTIONS.updated);
  });

  it('should call onDeleteRequest with item id when trash icon is clicked', () => {
    renderRow();

    fireEvent.click(screen.getByLabelText(LABELS.deleteButton));

    expect(mockOnDeleteRequest).toHaveBeenCalledTimes(1);
    expect(mockOnDeleteRequest).toHaveBeenCalledWith(MOCK_IDS.base);
  });

  it('should handle empty URL', () => {
    renderRow({ item: { ...baseItem, url: '' } });

    expect(screen.getByTestId(`mock-input-${LABELS.canonicalUrl}`)).toHaveValue('');
  });

  it('should handle URL without HTTP protocol via renderLinkPreview call', () => {
    renderRow({ item: { ...baseItem, url: MOCK_URLS.noProtocol } });

    expect(mockRenderLinkPreview).toHaveBeenCalledWith(MOCK_URLS.noProtocol);
  });

  it('should handle missing caption object gracefully', () => {
    renderRow({ item: { id: MOCK_IDS.missingCaption, url: MOCK_URLS.missingCaption } });

    expect(screen.getByTestId(`mock-input-${LABELS.caption}`)).toHaveValue('');
  });

  it('should handle undefined item.id correctly (fallback to empty string)', () => {
    renderRow({
      item: {
        id: undefined as unknown as string,
        url: MOCK_URLS.testUndefined,
        caption: { uk: MOCK_CAPTIONS.testUndefinedUk, en: MOCK_CAPTIONS.testUndefinedEn }
      }
    });

    fireEvent.change(screen.getByTestId(`mock-input-${LABELS.canonicalUrl}`), {
      target: { value: MOCK_URLS.testUndefinedNew }
    });
    fireEvent.change(screen.getByTestId(`mock-input-${LABELS.caption}`), {
      target: { value: MOCK_CAPTIONS.testUndefinedNew }
    });
    fireEvent.click(screen.getByLabelText(LABELS.deleteButton));

    expect(mockOnUpdateUrl).toHaveBeenCalledWith(undefined, MOCK_URLS.testUndefinedNew);
    expect(mockOnUpdateCaption).toHaveBeenCalledWith(undefined, MOCK_CAPTIONS.testUndefinedNew);
    expect(mockOnDeleteRequest).toHaveBeenCalledWith(undefined);
  });
});
