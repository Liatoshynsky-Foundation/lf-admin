import { fireEvent, render, screen, within } from '@testing-library/react';
import type { JSONContent } from '@tiptap/react';
import React from 'react';

import { IntroSection } from './IntroSection';

interface MockCustomTextFieldProps {
  readonly title: string;
  readonly value: JSONContent;
  readonly onChange: (value: JSONContent) => void;
}

interface MockQuoteBlockProps {
  readonly title: JSONContent;
  readonly description: JSONContent;
  readonly onTitleChange: (value: JSONContent) => void;
  readonly onDescriptionChange: (value: JSONContent) => void;
}

const setFieldMock = jest.fn();
const handleUploadImageMock = jest.fn();
const useUploadBlobMutationMock = jest.fn();

jest.mock('~/store', () => ({
  useStore: (selector: (state: { readonly locale: string; readonly setField: typeof setFieldMock }) => unknown) =>
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
  default: ({ children, title }: { readonly children: React.ReactNode; readonly title: string }) => (
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
    readonly imageUrl: string;
    readonly fileName: string;
    readonly onChangeImage: (url: string, crop: null) => void;
  }) => (
    <div data-testid="image-preview">
      <span data-testid="image-url">{imageUrl}</span>
      <span data-testid="file-name">{fileName}</span>
      <button onClick={() => onChangeImage('new-image.png', null)}>Upload Image</button>
    </div>
  )
}));

jest.mock('~/ds-components/text-field/TextField', () => ({
  CustomTextField: ({ title, value, onChange }: MockCustomTextFieldProps) => (
    <div data-testid={`textfield-wrapper-${title}`}>
      <span data-testid={`textfield-json-${title}`}>{JSON.stringify(value)}</span>
      <button
        data-testid={`trigger-textfield-change-${title}`}
        onClick={() => {
          const mockUpdatedJson: JSONContent = {
            type: 'doc',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: `Updated ${title}` }] }]
          };
          onChange(mockUpdatedJson);
        }}
      >
        Change {title}
      </button>
    </div>
  )
}));

jest.mock('../Liatoshynsky-office/quote-block/QuoteBlock', () => ({
  QuoteBlock: ({ title, description, onTitleChange, onDescriptionChange }: MockQuoteBlockProps) => (
    <div data-testid="quote-block">
      <span data-testid="quote-title-json">{JSON.stringify(title)}</span>
      <span data-testid="quote-description-json">{JSON.stringify(description)}</span>
      
      <button
        data-testid="trigger-quote-title-change"
        onClick={() => {
          const mockUpdatedTitleJson: JSONContent = {
            type: 'doc',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Updated Author Text' }] }]
          };
          onTitleChange(mockUpdatedTitleJson);
        }}
      >
        Change Quote Title
      </button>

      <button
        data-testid="trigger-quote-description-change"
        onClick={() => {
          const mockUpdatedDescJson: JSONContent = {
            type: 'doc',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Updated Quote Text' }] }]
          };
          onDescriptionChange(mockUpdatedDescJson);
        }}
      >
        Change Quote Description
      </button>
    </div>
  )
}));

const mockTitleJson: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Initial Title' }] }]
};

const mockCaptionJson: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Initial Caption' }] }]
};

const mockAuthorJson: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Initial Author' }] }]
};

const mockQuoteJson: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Initial Quote' }] }]
};


const expectSetField = (field: string, value: unknown) => {
  expect(setFieldMock).toHaveBeenCalledWith('about-us', 'IntroSection', field, expect.objectContaining(value));
};


describe('IntroSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePageBlockMock.mockReturnValue({
      block: {
        title: { uk: mockTitleJson },
        image: { src: 'test-image', caption: { uk: mockCaptionJson }, alt: { uk: mockCaptionJson } },
        quote: { source: { uk: mockAuthorJson }, text: { uk: mockQuoteJson } }
      }
    });
    render(<IntroSection />);
  });

  it('should render all fields with type-safe structural JSON states', () => {
    expect(screen.getByText('Вступна секція')).toBeInTheDocument();
    
    expect(screen.getByTestId('textfield-json-Заголовок сторінки')).toHaveTextContent(JSON.stringify(mockTitleJson));
    expect(screen.getByTestId('textfield-json-Підпис до зображення')).toHaveTextContent(JSON.stringify(mockCaptionJson));
    expect(screen.getByTestId('quote-title-json')).toHaveTextContent(JSON.stringify(mockAuthorJson));
    expect(screen.getByTestId('quote-description-json')).toHaveTextContent(JSON.stringify(mockQuoteJson));
  });

  it('should pass correct props to ImagePreviewBlock', () => {
    const preview = screen.getByTestId('image-preview');
    expect(within(preview).getByTestId('image-url')).toHaveTextContent(
      '/api/blob-url?folderName=photos&blobName=test-image'
    );
    expect(within(preview).getByTestId('file-name')).toHaveTextContent('test-image');
  });

  it('should call setField with a structured JSONContent tree when updating title textfield', () => {
    fireEvent.click(screen.getByTestId('trigger-textfield-change-Заголовок сторінки'));
    
    expectSetField('title', {
      uk: {
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Updated Заголовок сторінки' }] }]
      }
    });
  });

  it('should call setField with synchronized captions and alternative texts when modifying layout images', () => {
    fireEvent.click(screen.getByTestId('trigger-textfield-change-Підпис до зображення'));
    
    const expectedPayload = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Updated Підпис до зображення' }] }]
    };

    expectSetField('image', {
      caption: expect.objectContaining({ uk: expectedPayload }),
      alt: expect.objectContaining({ uk: expectedPayload })
    });
  });

  it('should call setField when modifying the quote blocks author target payload', () => {
    fireEvent.click(screen.getByTestId('trigger-quote-title-change'));
    
    expectSetField('quote', {
      source: expect.objectContaining({
        uk: {
          type: 'doc',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Updated Author Text' }] }]
        }
      })
    });
  });

  it('should call setField when modifying the quote blocks main descriptive body payload', () => {
    fireEvent.click(screen.getByTestId('trigger-quote-description-change'));
    
    expectSetField('quote', {
      text: expect.objectContaining({
        uk: {
          type: 'doc',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Updated Quote Text' }] }]
        }
      })
    });
  });
});
