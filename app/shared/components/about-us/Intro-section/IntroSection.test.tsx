import { fireEvent, render, screen, within } from '@testing-library/react';
import type { JSONContent } from '@tiptap/react';
import React from 'react';

import { createDocNode } from '../__mocks__/utils';
import { IntroSection } from './IntroSection';

interface MockQuoteBlockProps {
  readonly title: JSONContent;
  readonly description: JSONContent;
  readonly onTitleChange: (value: JSONContent) => void;
  readonly onDescriptionChange: (value: JSONContent) => void;
}

const setFieldMock = jest.fn();
const usePageBlockMock = jest.fn();

jest.mock('~/store', () => ({
  useStore: (selector: (state: { readonly locale: string; readonly setField: typeof setFieldMock }) => unknown) =>
    selector({ locale: 'uk', setField: setFieldMock })
}));

jest.mock('~/utils/uploadToTmpFolder', () => ({ handleUploadImage: jest.fn() }));
jest.mock('~/types/graphql/generated/graphql', () => ({ useUploadBlobMutation: () => [jest.fn()] }));

jest.mock('~/shared/hooks/use-page-block/usePageBlock', () => ({
  usePageBlock: (pageId: string, blockId: string) => usePageBlockMock(pageId, blockId)
}));

jest.mock('~/ds-components/collapsible-block/CollapsibleBlock');

jest.mock('~/ds-components/text-field/TextField');

jest.mock('~/ds-components/photo-block/PhotoBlock', () => ({
  ImagePreviewBlock: ({ imageUrl, fileName }: { readonly imageUrl: string; readonly fileName: string }) => (
    <div data-testid="image-preview">
      <span data-testid="image-url">{imageUrl}</span>
      <span data-testid="file-name">{fileName}</span>
    </div>
  )
}));

jest.mock('../Liatoshynsky-office/quote-block/QuoteBlock', () => ({
  __esModule: true,
  QuoteBlock: ({ title, description, onTitleChange, onDescriptionChange }: MockQuoteBlockProps) => (
    <div data-testid="quote-block">
      <span data-testid="quote-title-json">{JSON.stringify(title)}</span>
      <span data-testid="quote-description-json">{JSON.stringify(description)}</span>
      <button
        data-testid="trigger-quote-title-change"
        onClick={() => onTitleChange(createDocNode('Updated Author Text'))}
      >
        Change Quote Title
      </button>
      <button
        data-testid="trigger-quote-description-change"
        onClick={() => onDescriptionChange(createDocNode('Updated Quote Text'))}
      >
        Change Quote Description
      </button>
    </div>
  )
}));

const titles = {
  page: 'Заголовок сторінки',
  caption: 'Підпис до зображення'
};

const mockNodes = {
  title: createDocNode('Initial Title'),
  caption: createDocNode('Initial Caption'),
  author: createDocNode('Initial Author'),
  quote: createDocNode('Initial Quote')
};

const mockBlockData = {
  title: { uk: mockNodes.title },
  image: { src: 'test-image', caption: { uk: mockNodes.caption }, alt: { uk: mockNodes.caption } },
  quote: { source: { uk: mockNodes.author }, text: { uk: mockNodes.quote } }
};

const runSimulation = (testidToClick?: string) => {
  render(<IntroSection />);
  if (testidToClick) {
    fireEvent.click(screen.getByTestId(testidToClick));
  }
};

describe('IntroSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePageBlockMock.mockReturnValue({ block: mockBlockData });
  });

  it('should render all fields with type-safe structural JSON states', () => {
    runSimulation();

    expect(screen.getByText('Вступна секція')).toBeInTheDocument();
    expect(screen.getByTestId(`textfield-json-${titles.page}`)).toHaveTextContent(JSON.stringify(mockNodes.title));
    expect(screen.getByTestId(`textfield-json-${titles.caption}`)).toHaveTextContent(JSON.stringify(mockNodes.caption));
    expect(screen.getByTestId('quote-title-json')).toHaveTextContent(JSON.stringify(mockNodes.author));
    expect(screen.getByTestId('quote-description-json')).toHaveTextContent(JSON.stringify(mockNodes.quote));
  });

  it('should pass correct props to ImagePreviewBlock', () => {
    runSimulation();

    const preview = screen.getByTestId('image-preview');
    expect(within(preview).getByTestId('image-url')).toHaveTextContent(
      '/api/blob-url?folderName=photos&blobName=test-image'
    );
    expect(within(preview).getByTestId('file-name')).toHaveTextContent('test-image');
  });

  it.each([
    [
      'title textfield modifications',
      `trigger-change-${titles.page}`,
      'title',
      { uk: createDocNode(`Updated ${titles.page}`) }
    ],
    [
      'synchronized captions and alternative text rules',
      `trigger-change-${titles.caption}`,
      'image',
      {
        caption: expect.objectContaining({ uk: createDocNode(`Updated ${titles.caption}`) }),
        alt: expect.objectContaining({ uk: createDocNode(`Updated ${titles.caption}`) })
      }
    ],
    [
      'quote block author payload modifications',
      'trigger-quote-title-change',
      'quote',
      { source: expect.objectContaining({ uk: createDocNode('Updated Author Text') }) }
    ],
    [
      'quote block descriptive body alterations',
      'trigger-quote-description-change',
      'quote',
      { text: expect.objectContaining({ uk: createDocNode('Updated Quote Text') }) }
    ]
  ])('should correctly invoke setField on %s', (_scenario, triggerId, storeKey, expectedPayload) => {
    runSimulation(triggerId);

    expect(setFieldMock).toHaveBeenCalledWith(
      'about-us',
      'IntroSection',
      storeKey,
      expect.objectContaining(expectedPayload)
    );
  });
});
