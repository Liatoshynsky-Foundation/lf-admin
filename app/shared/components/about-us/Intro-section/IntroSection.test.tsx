import { fireEvent, render, screen, within } from '@testing-library/react';
import type { JSONContent } from '@tiptap/react';
import React from 'react';

import { IntroSection } from './IntroSection';
import { createDocNode } from '~/__mocks__/utils';

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
  ImagePreviewBlock: ({
    imageUrl,
    fileName,
    onChangeImage
  }: {
    readonly imageUrl: string;
    readonly fileName: string;
    readonly onChangeImage: (url: string, crop?: { x: number; y: number; width: number; height: number }) => void;
  }) => (
    <div data-testid="image-preview">
      <span data-testid="image-url">{imageUrl}</span>
      <span data-testid="file-name">{fileName}</span>
      <button
        data-testid="trigger-image-change-with-crop"
        onClick={() => onChangeImage('https://pub-2b50c59c64954ab89b7837f9f4607e12.r2.dev/photos/updated.jpg', {
          x: 1,
          y: 2,
          width: 300,
          height: 120
        })}
      >
        Change Image With Crop
      </button>
      <button
        data-testid="trigger-image-change-without-crop"
        onClick={() => onChangeImage('https://pub-2b50c59c64954ab89b7837f9f4607e12.r2.dev/photos/updated.jpg')}
      >
        Change Image Without Crop
      </button>
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
  image: {
    src: 'https://pub-2b50c59c64954ab89b7837f9f4607e12.r2.dev/photos/test-image.jpg',
    caption: { uk: mockNodes.caption },
    alt: { uk: mockNodes.caption }
  },
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

  it('should render skeleton when block data is missing', () => {
    usePageBlockMock.mockReturnValue({ block: null });

    const { container } = render(<IntroSection />);

    expect(container.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
    expect(screen.queryByTestId('image-preview')).not.toBeInTheDocument();
  });

  it('should render all fields with type-safe structural JSON states', () => {
    runSimulation();

    expect(screen.getByText('Initial Title')).toBeInTheDocument();
    expect(screen.getByTestId(`textfield-json-${titles.page}`)).toHaveTextContent(JSON.stringify(mockNodes.title));
    expect(screen.getByTestId(`textfield-json-${titles.caption}`)).toHaveTextContent(JSON.stringify(mockNodes.caption));
    expect(screen.getByTestId('quote-title-json')).toHaveTextContent(JSON.stringify(mockNodes.author));
    expect(screen.getByTestId('quote-description-json')).toHaveTextContent(JSON.stringify(mockNodes.quote));
  });

  it('should pass correct props to ImagePreviewBlock', () => {
    runSimulation();

    const preview = screen.getByTestId('image-preview');
    expect(within(preview).getByTestId('image-url')).toHaveTextContent(
      'https://pub-2b50c59c64954ab89b7837f9f4607e12.r2.dev/photos/test-image.jpg'
    );
    expect(within(preview).getByTestId('file-name')).toHaveTextContent('test-image');
  });

  it('should pass an empty filename when image source is missing', () => {
    usePageBlockMock.mockReturnValue({
      block: {
        ...mockBlockData,
        image: {
          ...mockBlockData.image,
          src: ''
        }
      }
    });

    runSimulation();

    expect(within(screen.getByTestId('image-preview')).getByTestId('file-name')).toHaveTextContent('');
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

  it('should update image source and crop when selected image includes crop data', () => {
    runSimulation('trigger-image-change-with-crop');

    expect(setFieldMock).toHaveBeenCalledWith('about-us', 'IntroSection', 'image', {
      ...mockBlockData.image,
      src: 'https://pub-2b50c59c64954ab89b7837f9f4607e12.r2.dev/photos/updated.jpg',
      isTmp: false,
      crop: {
        x: 1,
        y: 2,
        width: 300,
        height: 120
      }
    });
  });

  it('should reset image crop when selected image has no crop data', () => {
    runSimulation('trigger-image-change-without-crop');

    expect(setFieldMock).toHaveBeenCalledWith('about-us', 'IntroSection', 'image', {
      ...mockBlockData.image,
      src: 'https://pub-2b50c59c64954ab89b7837f9f4607e12.r2.dev/photos/updated.jpg',
      isTmp: false,
      crop: null
    });
  });
});
