import { fireEvent, render, screen, within } from '@testing-library/react';

import { IntroSection } from './IntroSection';

const setFieldMock = jest.fn();
const handleUploadImageMock = jest.fn();
const useUploadBlobMutationMock = jest.fn();

jest.mock('~/store', () => ({
  useStore: (selector: (state: { locale: string; setField: typeof setFieldMock }) => void) =>
    selector({ locale: 'uk', setField: setFieldMock })
}));

jest.mock('~/utils/uploadToTmpFolder', () => ({
  handleUploadImage: (...args: unknown[]) => handleUploadImageMock(...args)
}));

jest.mock('~/types/graphql/generated/graphql', () => ({
  useUploadBlobMutation: () => [useUploadBlobMutationMock]
}));

const usePageBlockMock = jest.fn();
jest.mock('~/shared/hooks/use-page-block/usePageBlock', () => ({
  usePageBlock: (pageId: string, blockId: string) => usePageBlockMock(pageId, blockId)
}));

jest.mock('../../design-system/collapsible-block/CollapsibleBlock', () => ({
  __esModule: true,
  default: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <section data-testid="collapsible">
      <h2>{title}</h2>
      {children}
    </section>
  )
}));

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
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <label>
      {title}
      <input data-testid={`textfield-${title}`} value={value} onChange={onChange} />
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

const expectSetField = (field: string, value: unknown) =>
  expect(setFieldMock).toHaveBeenCalledWith('about-us', 'IntroSection', field, expect.objectContaining(value));

const updateField = (testId: string, value: string) =>
  fireEvent.change(screen.getByTestId(testId), { target: { value } });

const updateMultipleFields = (updates: { testId: string; value: string; field: string; prop?: string }[]) => {
  updates.forEach(({ testId, value, field, prop }) => {
    updateField(testId, value);
    expectSetField(field, prop ? { [prop]: { uk: value } } : { uk: value });
  });
};

describe('EntrySection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePageBlockMock.mockReturnValue({
      block: {
        title: { uk: 'Title' },
        image: { src: 'test-image', caption: { uk: 'Caption' } },
        quote: { source: { uk: 'Author' }, text: { uk: 'Quote' } }
      }
    });
    render(<IntroSection />);
  });

  it('should render all fields when block exists', () => {
    expect(screen.getByText('Вступна секція')).toBeInTheDocument();
    ['Title', 'Caption', 'Author', 'Quote'].forEach((val) => expect(screen.getByDisplayValue(val)).toBeInTheDocument());
  });

  it('should pass correct props to ImagePreviewBlock', () => {
    const preview = screen.getByTestId('image-preview');
    expect(within(preview).getByTestId('image-url')).toHaveTextContent(
      '/api/blob-url?folderName=photos&blobName=test-image'
    );
    expect(within(preview).getByTestId('file-name')).toHaveTextContent('test-image');
  });

  it('should pass correct props to QuoteBlock', () => {
    expect(screen.getByTestId('quote-title-prop')).toHaveTextContent('Author');
    expect(screen.getByTestId('quote-description-prop')).toHaveTextContent('Quote');
  });

  it('should call setField when updating title', () => {
    updateField('textfield-Заголовок сторінки', 'New Title');
    expectSetField('title', { uk: 'New Title' });
  });

  it('should call setField when updating image caption', () => {
    updateField('textfield-Підпис до зображення', 'New Caption');
    expectSetField('image', { caption: { uk: 'New Caption' } });
  });

  it('should call setField when updating quote fields', () => {
    updateMultipleFields([
      { testId: 'quote-title', value: 'New Author', field: 'quote', prop: 'source' },
      { testId: 'quote-description', value: 'New Quote', field: 'quote', prop: 'text' }
    ]);
  });
});
