import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import OurMission from './OurMission';
import { createDocNode } from '~/__mocks__/utils';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { MissionListItemWithId } from '~/types/store/pages/about-us/blocks/missionBlock';


interface MockImagePreviewBlockProps {
  readonly title: string;
  readonly imageUrl: string;
  readonly altText?: string;
  readonly onChangeImage: (url: string, crop?: unknown) => void;
  readonly onChangeAltText?: (value: string) => void;
}

const setFieldMock = jest.fn();
const toggleBlockVisibilityMock = jest.fn();
const setFieldValidityMock = jest.fn();
const usePageBlockMock = jest.fn();
jest.mock('~/store', () => ({
  useStore: (selector: (state: { readonly locale: 'uk'; readonly setField: typeof setFieldMock; readonly toggleBlockVisibility: typeof toggleBlockVisibilityMock; readonly setFieldValidity: typeof setFieldValidityMock }) => unknown) =>
    selector({ locale: 'uk', setField: setFieldMock, toggleBlockVisibility: toggleBlockVisibilityMock, setFieldValidity: setFieldValidityMock })
}));
jest.mock('~/shared/hooks/use-page-block/usePageBlock', () => ({
  usePageBlock: () => usePageBlockMock()
}));
jest.mock('~/ds-components/collapsible-block/CollapsibleBlock');
jest.mock('~/ds-components/text-field/TextField');
jest.mock('~/components/grip/Grip');
jest.mock('../../sortable-list/SortableList');

jest.mock('~/ds-components/photo-block/PhotoBlock', () => ({
  __esModule: true,
  ImagePreviewBlock: ({ title, imageUrl, altText, onChangeImage, onChangeAltText }: MockImagePreviewBlockProps) => (
    <div data-testid={`image-block-${title}`}>
      <span data-testid={`image-url-${title}`}>{imageUrl}</span>
      <span data-testid={`alt-text-${title}`}>{altText}</span>
      <button data-testid={`upload-${title}`} onClick={() => onChangeImage('new-image-path.jpg')}>
        Upload
      </button>
      <button
        data-testid={`upload-with-crop-${title}`}
        onClick={() => onChangeImage('new-image-path.jpg', { rect: { x: 0, y: 0, width: 10, height: 10 } })}
      >
        Upload With Crop
      </button>
      <button data-testid={`alt-change-${title}`} onClick={() => onChangeAltText?.('Updated alt text')}>
        Change Alt Text
      </button>
    </div>
  )
}));

jest.mock('~/components/configurable-list/ConfigurableList');

const TARGET_ID = '1';
const keys = {
  title: 'Заголовок секції',
  item: 'Пункт місії',
  caption: 'Підпис до зображення (Перше зображення секції)',
  upload: 'Перше зображення секції',
  bigCaption: 'Підпис до зображення (Друге зображення секції)',
  bigUpload: 'Друге зображення секції'
};

beforeAll(() => {
  crypto.randomUUID = jest.fn(() => 'uuid-1') as typeof crypto.randomUUID;
  URL.createObjectURL = jest.fn(() => 'mocked-url');
});

const mockTitleJson = createDocNode('Initial title');
const mockItemJson = createDocNode('Initial point');
const mockCaptionJson = createDocNode('caption');
const mockAltJson = createDocNode('legacy alt text');

const mockBlock = {
  title: { uk: mockTitleJson },
  list: [{ id: TARGET_ID, uk: mockItemJson, en: { type: 'doc', content: [] } }] as MissionListItemWithId[],
  smallImage: {
    src: 'small.jpg',
    generatedSrc: '',
    caption: { uk: mockCaptionJson, en: {} },
    alt: { uk: mockAltJson, en: {} }
  },
  bigImage: {
    src: 'big.jpg',
    generatedSrc: '',
    caption: { uk: mockCaptionJson, en: {} },
    alt: { uk: mockAltJson, en: {} }
  }
};

const runSimulation = (testidToClick?: string) => {
  render(<OurMission />);
  if (testidToClick) {
    fireEvent.click(screen.getByTestId(testidToClick));
  }
};

describe('OurMission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePageBlockMock.mockReturnValue({ block: mockBlock });
  });

  it('should render headers and verify deep initial JSON content payloads inside the DOM', () => {
    runSimulation();

    expect(screen.getByTestId('collapsible-block')).toBeInTheDocument();
    expect(screen.getByTestId(`textfield-json-${keys.title}`)).toHaveTextContent(JSON.stringify(mockTitleJson));
    expect(screen.getByTestId(`textfield-json-${keys.item}`)).toHaveTextContent(JSON.stringify(mockItemJson));
    expect(screen.getByTestId(`alt-text-${keys.upload}`)).not.toHaveTextContent('[object Object]');
    expect(screen.getByTestId(`alt-text-${keys.upload}`)).toHaveTextContent('legacy alt text');
    expect(screen.getByTestId(`alt-text-${keys.bigUpload}`)).toHaveTextContent('legacy alt text');
  });

  it('should render skeleton when no block exists', () => {
    usePageBlockMock.mockReturnValue({ block: null });

    render(<OurMission />);

    expect(screen.queryByTestId('collapsible-block')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
  });

  it('should still render the image block when the image src is an empty string', () => {
    const blockWithEmptySrc = {
      ...mockBlock,
      smallImage: { ...mockBlock.smallImage, src: '' }
    };
    usePageBlockMock.mockReturnValue({ block: blockWithEmptySrc });

    render(<OurMission />);

    expect(screen.getByTestId(`image-block-${keys.upload}`)).toBeInTheDocument();
  });

  it.each([
    [
      'section title changes',
      `trigger-change-${keys.title}`,
      'title',
      expect.objectContaining({ uk: createDocNode(`Updated ${keys.title}`) })
    ],
    [
      'clicking the add action on lists',
      'add-btn',
      'list',
      expect.arrayContaining([
        expect.objectContaining({ id: TARGET_ID }),
        expect.objectContaining({ id: 'uuid-1', uk: { type: 'doc', content: [] }, en: { type: 'doc', content: [] } })
      ])
    ],
    [
      'triggering item drop action rows',
      `delete-${TARGET_ID}`,
      'list',
      []
    ],
    [
      'updating standard list point rich-text trees',
      `trigger-change-${keys.item}`,
      'list',
      expect.arrayContaining([
        expect.objectContaining({ id: TARGET_ID, uk: createDocNode(`Updated ${keys.item}`) })
      ])
    ],
    [
      'editing layout image configuration captions',
      `trigger-change-${keys.caption}`,
      'smallImage',
      expect.objectContaining({
        caption: expect.objectContaining({ uk: createDocNode(`Updated ${keys.caption}`) })
      })
    ],
    [
      'propagating new asset paths through upload channels',
      `upload-${keys.upload}`,
      'smallImage',
      expect.objectContaining({ src: 'new-image-path.jpg', isTmp: false, crop: null })
    ],
    [
      'editing layout image configuration captions for the second image',
      `trigger-change-${keys.bigCaption}`,
      'bigImage',
      expect.objectContaining({
        caption: expect.objectContaining({ uk: createDocNode(`Updated ${keys.bigCaption}`) })
      })
    ],
    [
      'propagating new asset paths through upload channels for the second image',
      `upload-${keys.bigUpload}`,
      'bigImage',
      expect.objectContaining({ src: 'new-image-path.jpg', isTmp: false, crop: null })
    ],
    [
      'editing alt text for the first image',
      `alt-change-${keys.upload}`,
      'smallImage',
      expect.objectContaining({ alt: expect.objectContaining({ uk: 'Updated alt text' }) })
    ],
    [
      'editing alt text for the second image',
      `alt-change-${keys.bigUpload}`,
      'bigImage',
      expect.objectContaining({ alt: expect.objectContaining({ uk: 'Updated alt text' }) })
    ]
  ])(
    'should correctly invoke setField upon %s',
    (_scenario, triggerId, storeKey, expectedPayload) => {
      runSimulation(triggerId);

      expect(setFieldMock).toHaveBeenCalledWith(
        PAGE_IDS.ABOUT_US,
        BLOCK_IDS.OUR_MISSION,
        storeKey,
        expectedPayload
      );
    }
  );

  it('should call toggleBlockVisibility with pageId and blockId when the visibility toggle is clicked', () => {
    runSimulation('collapsible-block-toggle-visibility');

    expect(toggleBlockVisibilityMock).toHaveBeenCalledWith(PAGE_IDS.ABOUT_US, BLOCK_IDS.OUR_MISSION);
  });

  it('should mark the title as invalid after blur when it is empty, and clear the flag on unmount', () => {
    usePageBlockMock.mockReturnValue({
      block: { ...mockBlock, title: { uk: { type: 'doc', content: [] } } }
    });

    const { unmount } = render(<OurMission />);

    fireEvent.click(screen.getByTestId(`trigger-blur-${keys.title}`));

    expect(screen.getByTestId(`textfield-error-${keys.title}`)).toBeInTheDocument();
    expect(setFieldValidityMock).toHaveBeenCalledWith(`${PAGE_IDS.ABOUT_US}:${BLOCK_IDS.OUR_MISSION}:title`, true);

    unmount();

    expect(setFieldValidityMock).toHaveBeenLastCalledWith(`${PAGE_IDS.ABOUT_US}:${BLOCK_IDS.OUR_MISSION}:title`, false);
  });

  it('should render the grip handle and handle drag-and-drop reordering', () => {
    const doubleMockBlock = {
      title: { uk: mockTitleJson },
      list: [
        { id: '1', uk: mockItemJson, en: { type: 'doc', content: [] } },
        { id: '2', uk: mockItemJson, en: { type: 'doc', content: [] } }
      ],
      smallImage: mockBlock.smallImage,
      bigImage: mockBlock.bigImage
    };
    usePageBlockMock.mockReturnValue({ block: doubleMockBlock });

    render(<OurMission />);

    expect(screen.getByTestId('collapsible-block-grip')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('mock-sortable-list'));

    expect(setFieldMock).toHaveBeenCalledWith(
      PAGE_IDS.ABOUT_US,
      BLOCK_IDS.OUR_MISSION,
      'list',
      [doubleMockBlock.list[1], doubleMockBlock.list[0]]
    );
  });

  it('should leave unrelated mission points untouched when updating a single point in a multi-point list', () => {
    const doubleMockBlock = {
      title: { uk: mockTitleJson },
      list: [
        { id: '1', uk: mockItemJson, en: { type: 'doc', content: [] } },
        { id: '2', uk: mockItemJson, en: { type: 'doc', content: [] } }
      ] as MissionListItemWithId[],
      smallImage: mockBlock.smallImage,
      bigImage: mockBlock.bigImage
    };
    usePageBlockMock.mockReturnValue({ block: doubleMockBlock });

    render(<OurMission />);
    fireEvent.click(screen.getAllByTestId(`trigger-change-${keys.item}`)[0]);

    expect(setFieldMock).toHaveBeenCalledWith(
      PAGE_IDS.ABOUT_US,
      BLOCK_IDS.OUR_MISSION,
      'list',
      [
        expect.objectContaining({ id: '1', uk: createDocNode(`Updated ${keys.item}`) }),
        doubleMockBlock.list[1]
      ]
    );
  });

  it('should propagate a provided crop through onChangeImage instead of falling back to null', () => {
    runSimulation(`upload-with-crop-${keys.upload}`);

    expect(setFieldMock).toHaveBeenCalledWith(
      PAGE_IDS.ABOUT_US,
      BLOCK_IDS.OUR_MISSION,
      'smallImage',
      expect.objectContaining({ src: 'new-image-path.jpg', isTmp: false, crop: { rect: { x: 0, y: 0, width: 10, height: 10 } } })
    );
  });

  it('should not render the mission points list when there are no points', () => {
    usePageBlockMock.mockReturnValue({
      block: { ...mockBlock, list: [] }
    });

    render(<OurMission />);

    expect(screen.queryByTestId('configurable-list')).not.toBeInTheDocument();
  });

  it('should not render image blocks when smallImage and bigImage are absent', () => {
    const { smallImage: _smallImage, bigImage: _bigImage, ...blockWithoutImages } = mockBlock;
    usePageBlockMock.mockReturnValue({ block: blockWithoutImages });

    render(<OurMission />);

    expect(screen.queryByTestId(`image-block-${keys.upload}`)).not.toBeInTheDocument();
    expect(screen.queryByTestId(`image-block-${keys.bigUpload}`)).not.toBeInTheDocument();
  });

  it('should handle early returns in image and caption handlers when image object becomes falsy', () => {
    let imageExists = true;
    const blockWithToggle = {
      ...mockBlock,
      get smallImage() {
        return imageExists ? mockBlock.smallImage : undefined;
      }
    };

    usePageBlockMock.mockReturnValue({ block: blockWithToggle });
    render(<OurMission />);

    imageExists = false;
    jest.clearAllMocks();

    fireEvent.click(screen.getByTestId(`upload-${keys.upload}`));
    fireEvent.click(screen.getByTestId(`alt-change-${keys.upload}`));
    fireEvent.click(screen.getByTestId(`trigger-change-${keys.caption}`));

    expect(setFieldMock).not.toHaveBeenCalled();
  });

  it('should use fallback title when block title is empty or undefined', () => {
    usePageBlockMock.mockReturnValue({
      block: { ...mockBlock, title: undefined }
    });
    
    render(<OurMission />);
    
    expect(screen.getByTestId('collapsible-block')).toBeInTheDocument();
  });
});