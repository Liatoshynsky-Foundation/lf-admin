import { fireEvent, render, screen } from '@testing-library/react';
import { JSONContent } from '@tiptap/react';
import React from 'react';

import OurMission from './OurMission';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';
import { MissionListItemWithId } from '~/types/store/pages/about-us/blocks/missionBlock';

interface MockCustomTextFieldProps {
  readonly title?: string;
  readonly label?: string;
  readonly value: JSONContent;
  readonly onChange: (value: JSONContent) => void;
}

interface MockImagePreviewBlockProps {
  readonly title: string;
  readonly imageUrl: string;
  readonly onChangeImage: (url: string) => void;
}

interface MockConfigurableListProps<T> {
  readonly items: readonly T[];
  readonly onCreate: () => { readonly id: string | number };
  readonly onDelete: (id: string | number) => void;
  readonly onChange: (item: T) => void;
  readonly renderItem: (props: {
    readonly item: T;
    readonly onChange: (item: T) => void;
  }) => React.ReactNode;
  readonly addBtnLabel: string;
}

const handleUploadImageMock = jest.fn();
const useUploadBlobMutationMock = jest.fn();

jest.mock('~/utils/uploadToTmpFolder', () => ({
  handleUploadImage: (...args: unknown[]) => handleUploadImageMock(...args)
}));

jest.mock('~/types/graphql/generated/graphql', () => ({
  useUploadBlobMutation: () => [useUploadBlobMutationMock]
}));

const setFieldMock = jest.fn();

jest.mock('~/store', () => ({
  useStore: (selector: (state: { readonly locale: 'uk'; readonly setField: typeof setFieldMock }) => unknown) =>
    selector({ locale: 'uk', setField: setFieldMock })
}));

const usePageBlockMock = jest.fn();
jest.mock('~/shared/hooks/use-page-block/usePageBlock', () => ({
  usePageBlock: () => usePageBlockMock()
}));

jest.mock('~/ds-components/collapsible-block/CollapsibleBlock', () => ({
  __esModule: true,
  default: ({ children, title }: { readonly children: React.ReactNode; readonly title: string }) => (
    <section data-testid="collapsible-block">
      <h2>{title}</h2>
      {children}
    </section>
  )
}));

jest.mock('~/components/configurable-list/ConfigurableList', () => ({
  __esModule: true,
  default: <T extends { readonly id: string | number; readonly value: JSONContent }>({
    items,
    onCreate,
    onDelete,
    onChange,
    renderItem,
    addBtnLabel
  }: MockConfigurableListProps<T>) => (
    <div data-testid="configurable-list">
      {items.map((item) => (
        <div key={item.id} data-testid={`list-item-${item.id}`}>
          {renderItem({
            item,
            onChange: (updatedItem) => onChange(updatedItem)
          })}
          <button data-testid={`delete-${item.id}`} onClick={() => onDelete(item.id)}>
            Delete
          </button>
        </div>
      ))}
      <button data-testid="add-btn" onClick={onCreate}>
        {addBtnLabel}
      </button>
    </div>
  )
}));

jest.mock('~/ds-components/text-field/TextField', () => ({
  __esModule: true,
  CustomTextField: ({ title, label, value, onChange }: MockCustomTextFieldProps) => {
    const selectorKey = title || label || 'default';
    return (
      <div data-testid={`textfield-wrapper-${selectorKey}`}>
        <span data-testid={`textfield-json-${selectorKey}`}>{JSON.stringify(value)}</span>
        <button
          data-testid={`trigger-change-${selectorKey}`}
          onClick={() => {
            const updatedJson: JSONContent = {
              type: 'doc',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: `Updated ${selectorKey}` }] }]
            };
            onChange(updatedJson);
          }}
        >
          Change {selectorKey}
        </button>
      </div>
    );
  }
}));

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

beforeAll(() => {
  crypto.randomUUID = jest.fn(() => 'uuid-1') as typeof crypto.randomUUID;
  URL.createObjectURL = jest.fn(() => 'mocked-url');
});

const mockTitleJson: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Initial title' }] }]
};

const mockItemJson: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Initial point' }] }]
};

const mockCaptionJson: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'caption' }] }]
};

const mockBlock = {
  title: { uk: mockTitleJson },
  list: [{ id: '1', uk: mockItemJson, en: { type: 'doc', content: [] } }] as MissionListItemWithId[],
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

describe('OurMission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePageBlockMock.mockReturnValue({ block: mockBlock });
  });

  it('should render headers and verify deep initial JSON content payloads inside the DOM', () => {
    render(<OurMission />);

    expect(screen.getByTestId('collapsible-block')).toBeInTheDocument();
    expect(screen.getByTestId('textfield-json-Заголовок секції')).toHaveTextContent(JSON.stringify(mockTitleJson));
    expect(screen.getByTestId('textfield-json-Пункт місії')).toHaveTextContent(JSON.stringify(mockItemJson));
  });

  it('should dispatch structural rich text updates to the store when the section title changes', () => {
    render(<OurMission />);

    fireEvent.click(screen.getByTestId('trigger-change-Заголовок секції'));

    expect(setFieldMock).toHaveBeenCalledWith(
      PAGE_IDS.ABOUT_US,
      BLOCK_IDS.OUR_MISSION,
      'title',
      expect.objectContaining({
        uk: {
          type: 'doc',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Updated Заголовок секції' }] }]
        }
      })
    );
  });

  it('should push a clean, empty structured array item to the schema list when clicking the add action', () => {
    render(<OurMission />);

    fireEvent.click(screen.getByTestId('add-btn'));

    expect(setFieldMock).toHaveBeenCalledWith(
      PAGE_IDS.ABOUT_US,
      BLOCK_IDS.OUR_MISSION,
      'list',
      expect.arrayContaining([
        expect.objectContaining({ id: '1' }),
        expect.objectContaining({
          id: 'uuid-1',
          uk: { type: 'doc', content: [] },
          en: { type: 'doc', content: [] }
        })
      ])
    );
  });

  it('should isolate identifiers and drop correct nodes when trigger actions occur', () => {
    render(<OurMission />);

    fireEvent.click(screen.getByTestId('delete-1'));

    expect(setFieldMock).toHaveBeenCalledWith(PAGE_IDS.ABOUT_US, BLOCK_IDS.OUR_MISSION, 'list', []);
  });

  it('should update mission points with fully formed JSONContent trees', () => {
    render(<OurMission />);

    fireEvent.click(screen.getByTestId('trigger-change-Пункт місії'));

    expect(setFieldMock).toHaveBeenCalledWith(
      PAGE_IDS.ABOUT_US,
      BLOCK_IDS.OUR_MISSION,
      'list',
      expect.arrayContaining([
        expect.objectContaining({
          id: '1',
          uk: {
            type: 'doc',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Updated Пункт місії' }] }]
          }
        })
      ])
    );
  });

  it('should pass structural object values down when editing small image configurations', () => {
    render(<OurMission />);

    fireEvent.click(screen.getByTestId('trigger-change-Підпис до зображення (Перше зображення секції)'));

    expect(setFieldMock).toHaveBeenCalledWith(
      PAGE_IDS.ABOUT_US,
      BLOCK_IDS.OUR_MISSION,
      'smallImage',
      expect.objectContaining({
        caption: expect.objectContaining({
          uk: {
            type: 'doc',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Updated Підпис до зображення (Перше зображення секції)' }] }]
          }
        })
      })
    );
  });

  it('should propagate new asset source paths cleanly through image modification channels', () => {
    render(<OurMission />);

    fireEvent.click(screen.getByTestId('upload-Перше зображення секції'));

    expect(setFieldMock).toHaveBeenCalledWith(
      PAGE_IDS.ABOUT_US,
      BLOCK_IDS.OUR_MISSION,
      'smallImage',
      expect.objectContaining({
        src: 'new-image-path.jpg',
        isTmp: false,
        crop: null
      })
    );
  });
});
