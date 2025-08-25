import { fireEvent, render, screen } from '@testing-library/react';

import { LiatoshynskyFoundation } from './LiatoshynskyFoundation';
import { textToProse } from '~/lib/utils/prose';
import { usePageBlocks } from '~/shared/hooks/use-page-blocks/usePageBlocks';
import { useStore } from '~/store';

type CollapsibleBlockProps = {
  title: string;
  children: React.ReactNode;
};

jest.mock('~/ds-components/collapsible-block/CollapsibleBlock', () => ({
  __esModule: true,
  default: ({ title, children }: CollapsibleBlockProps) => (
    <div data-testid="collapsible-block">
      <h2>{title}</h2>
      {children}
    </div>
  )
}));

type Paragraph = { text: string };
type FoundationBlockProps = {
  mainText: string;
  paragraphs: Paragraph[];
  onMainTextChange: (value: string) => void;
  onParagraphChange: (index: number, value: string) => void;
  onImageChange: (file: File) => void;
};

jest.mock('./foundation-block/FoundationBlock', () => ({
  __esModule: true,
  FoundationBlock: ({
    mainText,
    paragraphs,
    onMainTextChange,
    onParagraphChange,
    onImageChange
  }: FoundationBlockProps) => (
    <div data-testid="foundation-block">
      <textarea aria-label="Main text" value={mainText} onChange={(e) => onMainTextChange(e.target.value)} />
      {paragraphs.map((p, i) => (
        <textarea
          key={`${p.text}-${i}`}
          aria-label={`Paragraph ${i + 1}`}
          value={p.text}
          onChange={(e) => onParagraphChange(i, e.target.value)}
        />
      ))}
      <input
        aria-label="Image input"
        type="file"
        onChange={(e) => {
          if (e.target.files) onImageChange(e.target.files[0]);
        }}
      />
    </div>
  )
}));

jest.mock('~/shared/hooks/use-page-blocks/usePageBlocks');
jest.mock('~/store');

jest.mock('@mui/material', () => {
  const original = jest.requireActual('@mui/material');
  return {
    ...original,
    Skeleton: () => (
      <progress aria-busy="true" value={0} max={100}>
        Loading...
      </progress>
    )
  };
});

global.URL.createObjectURL = jest.fn(() => 'blob:mocked-url');

const usePageBlocksMock = usePageBlocks as jest.Mock;

const mockBlock = {
  ourOrganisation: {
    uk: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Основний текст секції' }] }] },
    en: { type: 'doc', content: [] }
  },
  ourName: {
    uk: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Текст 1 абзацу' }] }] },
    en: { type: 'doc', content: [] }
  },
  ourBelief: {
    uk: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Текст 2 абзацу' }] }] },
    en: { type: 'doc', content: [] }
  },
  image: { src: 'image1', caption: { uk: 'Caption UK', en: 'Caption EN' } }
};

describe('LiatoshynskyFoundation', () => {
  const setFieldMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    usePageBlocksMock.mockReturnValue({ blocks: { FoundationInfo: mockBlock } });

    (useStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({ setField: setFieldMock, locale: 'uk' })
    );
  });

  it('should render skeleton when block is missing', () => {
    usePageBlocksMock.mockReturnValue({ blocks: {} });
    render(<LiatoshynskyFoundation />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render CollapsibleBlock with title', () => {
    render(<LiatoshynskyFoundation />);
    expect(screen.getByTestId('collapsible-block')).toBeInTheDocument();
    expect(screen.getByText('Фундація Лятошинського')).toBeInTheDocument();
  });

  it('should call setField on paragraph change', () => {
    render(<LiatoshynskyFoundation />);
    const paragraph1 = screen.getByLabelText('Paragraph 1');

    fireEvent.change(paragraph1, { target: { value: 'Оновлений текст 1 абзацу' } });

    expect(setFieldMock).toHaveBeenLastCalledWith(
      'about-us',
      'FoundationInfo',
      'ourName',
      expect.objectContaining({
        uk: textToProse('Оновлений текст 1 абзацу')
      })
    );
  });

  it('should call setField on main text change', () => {
    render(<LiatoshynskyFoundation />);
    const mainTextArea = screen.getByLabelText('Main text');

    fireEvent.change(mainTextArea, { target: { value: 'Оновлений основний текст' } });

    expect(setFieldMock).toHaveBeenLastCalledWith(
      'about-us',
      'FoundationInfo',
      'ourOrganisation',
      expect.objectContaining({
        uk: textToProse('Оновлений основний текст')
      })
    );
  });

  it('should call setField on image change', () => {
    render(<LiatoshynskyFoundation />);
    const fileInput = screen.getByLabelText('Image input');
    const file = new File(['dummy'], 'test.png', { type: 'image/png' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(setFieldMock).toHaveBeenLastCalledWith(
      'about-us',
      'FoundationInfo',
      'image',
      expect.objectContaining({
        src: 'blob:mocked-url',
        generatedSrc: 'blob:mocked-url'
      })
    );
  });
});
