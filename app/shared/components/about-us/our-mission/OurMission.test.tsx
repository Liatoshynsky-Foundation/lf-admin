import { fireEvent, render, screen } from '@testing-library/react';

import OurMission from './OurMission';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';

const setFieldMock = jest.fn();

type StoreState = { locale: 'uk'; setField: typeof setFieldMock };
jest.mock('~/store', () => ({
  useStore: (selector: (state: StoreState) => unknown) => selector({ locale: 'uk', setField: setFieldMock })
}));

const usePageBlockMock = jest.fn();
jest.mock('~/shared/hooks/use-page-block/usePageBlock', () => ({
  usePageBlock: (...args: unknown[]) => usePageBlockMock(...args)
}));

jest.mock('~/ds-components/collapsible-block/CollapsibleBlock', () => ({
  __esModule: true,
  default: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <section data-testid="collapsible-block">
      <h2>{title}</h2>
      {children}
    </section>
  )
}));

jest.mock('~/components/configurable-list/ConfigurableList', () => ({
  __esModule: true,
  default: ({
    items,
    onCreate,
    onDelete,
    onChange,
    renderItem,
    addBtnLabel
  }: {
    items: { id: string }[];
    onCreate: () => void;
    onDelete: (id: string) => void;
    onChange: (id: string, value: unknown) => void;
    renderItem: (props: { item: { id: string }; onChange: (id: string, value: unknown) => void }) => React.ReactNode;
    addBtnLabel: string;
  }) => (
    <div data-testid="configurable-list">
      {items.map((item: { id: string }) => (
        <div key={item.id} data-testid="list-item">
          {renderItem({ item, onChange })}
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
  CustomTextField: ({
    title,
    label,
    value,
    onChange
  }: {
    title?: string;
    label?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <div data-testid={`textfield-${title || label}`}>
      <input data-testid={`input-${title || label}`} value={value} onChange={onChange} />
    </div>
  )
}));

jest.mock('~/ds-components/photo-block/PhotoBlock', () => ({
  ImagePreviewBlock: ({
    title,
    imageUrl,
    onChangeImage
  }: {
    title: string;
    imageUrl: string;
    onChangeImage: (file: File) => void;
  }) => (
    <div data-testid={`image-block-${title}`}>
      <span>{imageUrl}</span>
      <button data-testid={`upload-${title}`} onClick={() => onChangeImage(new File([''], 'test.png'))}>
        Upload
      </button>
    </div>
  )
}));

beforeAll(() => {
  crypto.randomUUID = jest.fn(() => 'uuid-1') as typeof crypto.randomUUID;
  URL.createObjectURL = jest.fn(() => 'mocked-url');
});

const mockBlock = {
  title: { uk: 'Initial title' },
  list: [{ id: '1', uk: { type: 'doc', content: [] }, en: { type: 'doc', content: [] } }],
  smallImage: {
    src: 'small',
    generatedSrc: '',
    caption: { uk: 'caption', en: '' },
    alt: { uk: '', en: '' }
  },
  bigImage: {
    src: 'big',
    generatedSrc: '',
    caption: { uk: 'caption', en: '' },
    alt: { uk: '', en: '' }
  }
};

describe('OurMission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render title and collapsible block', () => {
    usePageBlockMock.mockReturnValue({ block: mockBlock });
    render(<OurMission />);
    expect(screen.getByTestId('collapsible-block')).toBeInTheDocument();
    expect(screen.getByTestId('input-Заголовок секції')).toHaveValue('Initial title');
  });

  it('should change section title', () => {
    usePageBlockMock.mockReturnValue({ block: mockBlock });
    render(<OurMission />);
    fireEvent.change(screen.getByTestId('input-Заголовок секції'), {
      target: { value: 'New title' }
    });
    expect(setFieldMock).toHaveBeenCalledWith(PAGE_IDS.ABOUT_US, BLOCK_IDS.OUR_MISSION, 'title', { uk: 'New title' });
  });

  it('should add and deletes mission points', () => {
    usePageBlockMock.mockReturnValue({ block: mockBlock });
    render(<OurMission />);
    fireEvent.click(screen.getByTestId('add-btn'));
    expect(setFieldMock).toHaveBeenCalledWith(PAGE_IDS.ABOUT_US, BLOCK_IDS.OUR_MISSION, 'list', expect.any(Array));

    fireEvent.click(screen.getByTestId('delete-1'));
    expect(setFieldMock).toHaveBeenCalledWith(PAGE_IDS.ABOUT_US, BLOCK_IDS.OUR_MISSION, 'list', expect.any(Array));
  });

  it('should update mission point value', () => {
    usePageBlockMock.mockReturnValue({ block: mockBlock });
    render(<OurMission />);
    fireEvent.change(screen.getByTestId('input-Пункт місії'), {
      target: { value: 'Updated mission' }
    });
    expect(setFieldMock).toHaveBeenCalledWith(PAGE_IDS.ABOUT_US, BLOCK_IDS.OUR_MISSION, 'list', expect.any(Array));
  });

  it.each([0, 1])('should upload image file for image index %i', (index) => {
    render(<OurMission />);
    fireEvent.click(screen.getAllByText('Upload')[index]);
    expect(setFieldMock).toHaveBeenCalled();
  });
});
