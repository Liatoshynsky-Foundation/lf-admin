import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import OurMission from './OurMission';
import { createDocNode } from '~/__mocks__/utils';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { MissionListItemWithId } from '~/types/store/pages/about-us/blocks/missionBlock';


interface MockImagePreviewBlockProps {
  readonly title: string;
  readonly imageUrl: string;
  readonly onChangeImage: (url: string) => void;
}

const setFieldMock = jest.fn();
const usePageBlockMock = jest.fn();
jest.mock('~/utils/uploadToTmpFolder', () => ({ handleUploadImage: jest.fn() }));
jest.mock('~/types/graphql/generated/graphql', () => ({ useUploadBlobMutation: () => [jest.fn()] }));
jest.mock('~/store', () => ({
  useStore: (selector: (state: { readonly locale: 'uk'; readonly setField: typeof setFieldMock }) => unknown) =>
    selector({ locale: 'uk', setField: setFieldMock })
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
  ImagePreviewBlock: ({ title, imageUrl, onChangeImage }: MockImagePreviewBlockProps) => (
    <div data-testid={`image-block-${title}`}>
      <span data-testid={`image-url-${title}`}>{imageUrl}</span>
      <button data-testid={`upload-${title}`} onClick={() => onChangeImage('new-image-path.jpg')}>
        Upload
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
  upload: 'Перше зображення секції'
};

beforeAll(() => {
  crypto.randomUUID = jest.fn(() => 'uuid-1') as typeof crypto.randomUUID;
  URL.createObjectURL = jest.fn(() => 'mocked-url');
});

const mockTitleJson = createDocNode('Initial title');
const mockItemJson = createDocNode('Initial point');
const mockCaptionJson = createDocNode('caption');

const mockBlock = {
  title: { uk: mockTitleJson },
  list: [{ id: TARGET_ID, uk: mockItemJson, en: { type: 'doc', content: [] } }] as MissionListItemWithId[],
  smallImage: {
    src: 'small.jpg',
    generatedSrc: '',
    caption: { uk: mockCaptionJson, en: {} },
    alt: { uk: {}, en: {} }
  },
  bigImage: {
    src: 'big.jpg',
    generatedSrc: '',
    caption: { uk: mockCaptionJson, en: {} },
    alt: { uk: {}, en: {} }
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
});
