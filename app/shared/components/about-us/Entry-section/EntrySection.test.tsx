import { fireEvent, render, screen, within } from '@testing-library/react';
import type { ChangeEvent, ReactNode } from 'react';

import { EntrySection } from './EntrySection';

// 🔹 Загальний мок для setField
const setFieldMock = jest.fn();

// 🔹 Мок стора
jest.mock('~/store', () => ({
  useStore: (selector: (s: { locale: string; setField: typeof setFieldMock }) => unknown) =>
    selector({ locale: 'uk', setField: setFieldMock })
}));

// 🔹 Мок usePageBlocks (перевизначається у тестах)
const usePageBlocksMock = jest.fn();
jest.mock('~/shared/hooks/use-page-blocks/usePageBlocks', () => ({
  usePageBlocks: (...args: unknown[]) => usePageBlocksMock(...args)
}));

// 🔹 CollapsibleBlock
jest.mock('../../design-system/collapsible-block/CollapsibleBlock', () => ({
  __esModule: true,
  default: ({ children, title }: { children: ReactNode; title: string }) => (
    <section data-testid="collapsible">
      <h2>{title}</h2>
      {children}
    </section>
  )
}));

// 🔹 ImagePreviewBlock
jest.mock('../../design-system/photo-block/PhotoBlock', () => ({
  ImagePreviewBlock: ({
    imageUrl,
    fileName,
    onChangeImage
  }: {
    imageUrl: string;
    fileName: string;
    onChangeImage: (file: { name: string }) => void;
  }) => (
    <div data-testid="image-preview">
      <span data-testid="image-url">{imageUrl}</span>
      <span data-testid="file-name">{fileName}</span>
      <button onClick={() => onChangeImage({ name: 'new.png' })}>Upload Image</button>
    </div>
  )
}));

jest.mock('../../design-system/text-field/TextField', () => ({
  CustomTextField: ({
    title,
    value,
    onChange
  }: {
    title: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <label>
      {title}
      <input data-testid={`textfield-${title}`} value={value} onChange={(e) => onChange(e)} />
    </label>
  )
}));

jest.mock('../Liatoshynsky-office/quote-block/QuoteBlock', () => ({
  QuoteBlock: ({
    title,
    description,
    onTitleChange,
    onDescriptionChange
  }: {
    title: string;
    description: string;
    onTitleChange: (val: string) => void;
    onDescriptionChange: (val: string) => void;
  }) => (
    <div data-testid="quote-block">
      <span data-testid="quote-title-prop">{title}</span>
      <span data-testid="quote-description-prop">{description}</span>
      <input data-testid="quote-title" value={title} onChange={(e) => onTitleChange(e.target.value)} />
      <input
        data-testid="quote-description"
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
      />
    </div>
  )
}));

describe('EntrySection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePageBlocksMock.mockReturnValue({
      blocks: {
        IntroSection: {
          title: { uk: 'Title' },
          image: { src: 'test-image', caption: { uk: 'Caption' } },
          quote: { source: { uk: 'Author' }, text: { uk: 'Quote' } }
        }
      }
    });
  });

  it('should render all fields when block exists', () => {
    render(<EntrySection />);
    expect(screen.getByText('Вступна секція')).toBeInTheDocument();
    ['Title', 'Caption', 'Author', 'Quote'].forEach((val) => expect(screen.getByDisplayValue(val)).toBeInTheDocument());
  });

  it('should pass correct props to ImagePreviewBlock', () => {
    render(<EntrySection />);
    const preview = screen.getByTestId('image-preview');
    expect(within(preview).getByTestId('image-url')).toHaveTextContent('/images/test-image.png');
    expect(within(preview).getByTestId('file-name')).toHaveTextContent('test-image');
  });

  it('should pass correct props to QuoteBlock', () => {
    render(<EntrySection />);
    expect(screen.getByTestId('quote-title-prop')).toHaveTextContent('Author');
    expect(screen.getByTestId('quote-description-prop')).toHaveTextContent('Quote');
  });

  it('should call setField when updating title', () => {
    render(<EntrySection />);
    fireEvent.change(screen.getByTestId('textfield-Заголовок сторінки'), {
      target: { value: 'New Title' }
    });
    expect(setFieldMock).toHaveBeenCalledWith(
      'about-us',
      'IntroSection',
      'title',
      expect.objectContaining({ uk: 'New Title' })
    );
  });

  it('should call setField when uploading new image', () => {
    render(<EntrySection />);
    fireEvent.click(screen.getByText('Upload Image'));
    expect(setFieldMock).toHaveBeenCalledWith(
      'about-us',
      'IntroSection',
      'image',
      expect.objectContaining({ src: 'new.png', generatedSrc: expect.stringContaining('new.png') })
    );
  });

  it('should call setField when updating image caption', () => {
    render(<EntrySection />);
    fireEvent.change(screen.getByTestId('textfield-Підпис до зображення'), {
      target: { value: 'New Caption' }
    });
    expect(setFieldMock).toHaveBeenCalledWith(
      'about-us',
      'IntroSection',
      'image',
      expect.objectContaining({ caption: expect.objectContaining({ uk: 'New Caption' }) })
    );
  });

  it('should call setField when updating quote fields', () => {
    render(<EntrySection />);
    fireEvent.change(screen.getByTestId('quote-title'), { target: { value: 'New Author' } });
    fireEvent.change(screen.getByTestId('quote-description'), { target: { value: 'New Quote' } });

    expect(setFieldMock).toHaveBeenCalledWith(
      'about-us',
      'IntroSection',
      'quote',
      expect.objectContaining({ source: expect.objectContaining({ uk: 'New Author' }) })
    );
    expect(setFieldMock).toHaveBeenCalledWith(
      'about-us',
      'IntroSection',
      'quote',
      expect.objectContaining({ text: expect.objectContaining({ uk: 'New Quote' }) })
    );
  });
});
