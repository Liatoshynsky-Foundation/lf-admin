import { DragEndEvent } from '@dnd-kit/core';
import { fireEvent, render, screen } from '@testing-library/react';
import React, { ReactNode } from 'react';

import { GroupPerformancesSection } from './GroupPerformancesSection';
import { PerformanceRowProps } from './PerformanceRow';
import { handleSortableDragEnd } from '~/lib/utils/sortableDragEndHelper';

const MOCK_UUID = 'mock-uuid-1234';

const MOCK_TEXTS = {
  sectionTitle: 'Тестовий заголовок виступів',
  newSectionTitle: 'Нова назва секції',
  updatedCaption: 'updated caption',
  updatedUrl: 'updated-url'
};

const MOCK_URLS = {
  youtube: 'https://youtube.com',
  example: 'https://example.com',
  youtubeWatch: 'https://youtube.com/watch?v=abc123',
  youtubeShort: 'https://youtu.be/xyz789',
  plainText: 'example.com/page',
  expectedPlainLink: 'https://example.com/page'
};

const MOCK_YOUTUBE_IDS = {
  watch: 'abc123',
  short: 'xyz789'
};

let capturedRenderLinkPreview: ((url: string) => React.ReactNode) | null = null;
let capturedOnDragEnd: ((event: DragEndEvent) => void) | null = null;

jest.mock('./PerformanceRow', () => ({
  PerformanceRow: ({ item, onUpdateUrl, onUpdateCaption, onDeleteRequest, renderLinkPreview }: PerformanceRowProps) => {
    capturedRenderLinkPreview = renderLinkPreview;
    return (
      <div data-testid={`mock-performance-row-${item.id}`}>
        <button
          data-testid={`mock-update-url-${item.id}`}
          onClick={() => onUpdateUrl(item.id ?? '', MOCK_TEXTS.updatedUrl)}
        >
          update url
        </button>
        <button
          data-testid={`mock-update-caption-${item.id}`}
          onClick={() => onUpdateCaption(item.id ?? '', MOCK_TEXTS.updatedCaption)}
        >
          update caption
        </button>
        <button data-testid={`mock-delete-${item.id}`} onClick={() => onDeleteRequest(item.id ?? '')}>
          delete
        </button>
      </div>
    );
  }
}));

jest.mock('~/shared/components/sortable-list/SortableList', () => ({
  SortableList: ({ children, onDragEnd }: { children: ReactNode; onDragEnd: (event: DragEndEvent) => void }) => {
    capturedOnDragEnd = onDragEnd;
    return <div data-testid="mock-sortable-list">{children}</div>;
  }
}));

jest.mock('~/shared/components/sortable-item-wrapper/SortableItemWrapper', () => ({
  SortableItemWrapper: ({ children, id }: { children: ReactNode; id: string }) => (
    <div data-testid={`mock-sortable-item-${id}`}>{children}</div>
  )
}));

jest.mock('~/shared/components/design-system/text-field/TextField', () => ({
  CustomTextField: ({
    label,
    value,
    onChange
  }: {
    label: string;
    value?: unknown;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
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

jest.mock('~/shared/components/design-system/button/Button', () => ({
  __esModule: true,
  default: ({ children, onClick }: { children: ReactNode; onClick: () => void }) => (
    <button data-testid="mock-button-add" onClick={onClick}>
      {children}
    </button>
  )
}));

jest.mock('~/shared/components/delete-card-modal/DeleteCardModal', () => ({
  __esModule: true,
  default: ({ open, onClose, onDelete }: { open: boolean; onClose: () => void; onDelete: () => void }) =>
    open ? (
      <div data-testid="mock-delete-modal">
        <button data-testid="modal-cancel" onClick={onClose}>
          Скасувати
        </button>
        <button data-testid="modal-confirm" onClick={onDelete}>
          Підтвердити
        </button>
      </div>
    ) : null
}));

jest.mock('~/public/icons/plus.svg', () => ({
  __esModule: true,
  default: () => <span data-testid="icon-plus" />
}));

jest.mock('~/lib/utils/generateUniqueId', () => ({
  generateUniqueId: () => 'mock-uuid-1234'
}));

jest.mock('~/lib/utils/sortableDragEndHelper', () => ({
  handleSortableDragEnd: jest.fn()
}));

const mockOnChangeSectionTitle = jest.fn();
const mockOnChangePerformances = jest.fn();

const defaultProps = {
  currentLanguage: 'UA' as const,
  sectionTitle: MOCK_TEXTS.sectionTitle,
  performances: [
    { id: '1', url: MOCK_URLS.youtube, caption: { uk: 'Перший виступ', en: 'First performance' } },
    { id: '2', url: MOCK_URLS.example, caption: { uk: 'Другий виступ', en: 'Second performance' } }
  ],
  onChangeSectionTitle: mockOnChangeSectionTitle,
  onChangePerformances: mockOnChangePerformances
};

describe('GroupPerformancesSection Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedRenderLinkPreview = null;
    capturedOnDragEnd = null;
  });

  it('should render section title and a row for each performance', () => {
    render(<GroupPerformancesSection {...defaultProps} />);

    expect(screen.getByTestId('mock-input-Заголовок секції')).toHaveValue(MOCK_TEXTS.sectionTitle);
    expect(screen.getByTestId('mock-performance-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('mock-performance-row-2')).toBeInTheDocument();
  });

  it('should call onChangeSectionTitle when section title input changes', () => {
    render(<GroupPerformancesSection {...defaultProps} />);

    fireEvent.change(screen.getByTestId('mock-input-Заголовок секції'), {
      target: { value: MOCK_TEXTS.newSectionTitle }
    });

    expect(mockOnChangeSectionTitle).toHaveBeenCalledTimes(1);
    expect(mockOnChangeSectionTitle).toHaveBeenCalledWith(MOCK_TEXTS.newSectionTitle);
  });

  it('should add a new performance when "Додати пункт" is clicked', () => {
    render(<GroupPerformancesSection {...defaultProps} />);

    fireEvent.click(screen.getByTestId('mock-button-add'));

    expect(mockOnChangePerformances).toHaveBeenCalledTimes(1);
    expect(mockOnChangePerformances).toHaveBeenCalledWith([
      ...defaultProps.performances,
      { id: MOCK_UUID, url: '', caption: { uk: '', en: '' } }
    ]);
  });

  it('should update performance URL correctly via PerformanceRow callback', () => {
    render(<GroupPerformancesSection {...defaultProps} />);

    fireEvent.click(screen.getByTestId('mock-update-url-1'));

    expect(mockOnChangePerformances).toHaveBeenCalledTimes(1);
    expect(mockOnChangePerformances).toHaveBeenCalledWith([
      { ...defaultProps.performances[0], url: MOCK_TEXTS.updatedUrl },
      defaultProps.performances[1]
    ]);
  });

  it('should update performance caption correctly via PerformanceRow callback', () => {
    render(<GroupPerformancesSection {...defaultProps} />);

    fireEvent.click(screen.getByTestId('mock-update-caption-2'));

    expect(mockOnChangePerformances).toHaveBeenCalledTimes(1);
    expect(mockOnChangePerformances).toHaveBeenCalledWith([
      defaultProps.performances[0],
      { ...defaultProps.performances[1], caption: { uk: MOCK_TEXTS.updatedCaption, en: 'Second performance' } }
    ]);
  });

  it('should open delete modal when delete is requested from a row', () => {
    render(<GroupPerformancesSection {...defaultProps} />);

    expect(screen.queryByTestId('mock-delete-modal')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('mock-delete-2'));
    expect(screen.getByTestId('mock-delete-modal')).toBeInTheDocument();
  });

  it('should delete performance when confirmed in the modal', () => {
    render(<GroupPerformancesSection {...defaultProps} />);

    fireEvent.click(screen.getByTestId('mock-delete-1'));
    fireEvent.click(screen.getByTestId('modal-confirm'));

    expect(mockOnChangePerformances).toHaveBeenCalledTimes(1);
    expect(mockOnChangePerformances).toHaveBeenCalledWith([defaultProps.performances[1]]);
  });

  it('should close delete modal without deleting when canceled', () => {
    render(<GroupPerformancesSection {...defaultProps} />);

    fireEvent.click(screen.getByTestId('mock-delete-1'));
    fireEvent.click(screen.getByTestId('modal-cancel'));

    expect(mockOnChangePerformances).not.toHaveBeenCalled();
    expect(screen.queryByTestId('mock-delete-modal')).not.toBeInTheDocument();
  });

  it('should call handleSortableDragEnd with event, performances and onChangePerformances', () => {
    render(<GroupPerformancesSection {...defaultProps} />);

    const dragEvent = { active: { id: '1' }, over: { id: '2' } } as DragEndEvent;
    capturedOnDragEnd?.(dragEvent);

    expect(handleSortableDragEnd).toHaveBeenCalledTimes(1);
    expect(handleSortableDragEnd).toHaveBeenCalledWith(dragEvent, defaultProps.performances, mockOnChangePerformances);
  });

  it('should fallback caption.uk to empty string when item.caption is missing (langKey=uk)', () => {
    const propsWithoutCaption = {
      ...defaultProps,
      performances: [{ id: '3', url: MOCK_URLS.youtube }]
    };

    render(<GroupPerformancesSection {...propsWithoutCaption} />);
    fireEvent.click(screen.getByTestId('mock-update-caption-3'));

    expect(mockOnChangePerformances).toHaveBeenCalledWith([
      { id: '3', url: MOCK_URLS.youtube, caption: { uk: MOCK_TEXTS.updatedCaption, en: '' } }
    ]);
  });

  it('should fallback caption.en to empty string when item.caption is missing (langKey=en)', () => {
    const propsWithoutCaption = {
      ...defaultProps,
      currentLanguage: 'EN' as const,
      performances: [{ id: '3', url: MOCK_URLS.youtube }]
    };

    render(<GroupPerformancesSection {...propsWithoutCaption} />);
    fireEvent.click(screen.getByTestId('mock-update-caption-3'));

    expect(mockOnChangePerformances).toHaveBeenCalledWith([
      { id: '3', url: MOCK_URLS.youtube, caption: { uk: '', en: MOCK_TEXTS.updatedCaption } }
    ]);
  });

  describe('renderLinkPreview', () => {
    it('should return null for empty url', () => {
      render(<GroupPerformancesSection {...defaultProps} />);
      expect(capturedRenderLinkPreview?.('')).toBeNull();
    });

    it('should render YouTube preview for youtube.com/watch url', () => {
      render(<GroupPerformancesSection {...defaultProps} />);

      const { container } = render(<>{capturedRenderLinkPreview?.(MOCK_URLS.youtubeWatch)}</>);

      const img = container.querySelector('img[alt="YouTube Preview"]');
      expect(img).toHaveAttribute('src', `https://img.youtube.com/vi/${MOCK_YOUTUBE_IDS.watch}/mqdefault.jpg`);
      expect(screen.getByText('Відкрити відео')).toBeInTheDocument();
    });

    it('should render YouTube preview for youtu.be short url', () => {
      render(<GroupPerformancesSection {...defaultProps} />);

      const { container } = render(<>{capturedRenderLinkPreview?.(MOCK_URLS.youtubeShort)}</>);

      const img = container.querySelector('img[alt="YouTube Preview"]');
      expect(img).toHaveAttribute('src', `https://img.youtube.com/vi/${MOCK_YOUTUBE_IDS.short}/mqdefault.jpg`);
    });

    it('should render plain link preview for non-YouTube url', () => {
      render(<GroupPerformancesSection {...defaultProps} />);

      render(<>{capturedRenderLinkPreview?.(MOCK_URLS.plainText)}</>);

      const link = screen.getByText('Перейти за посиланням');
      expect(link).toHaveAttribute('href', MOCK_URLS.expectedPlainLink);
    });
  });
});
