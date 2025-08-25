import { fireEvent, render, screen } from '@testing-library/react';
import type { ChangeEvent } from 'react';

import type { MissionPoint } from './OurMission';
import OurMission from './OurMission';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';

type StoreState = { locale: 'uk'; setField: typeof setFieldMock };
const setFieldMock = jest.fn();

jest.mock('~/store', () => ({
  useStore: (selector: (state: StoreState) => unknown) => selector({ locale: 'uk', setField: setFieldMock })
}));

const usePageBlocksMock = jest.fn();
jest.mock('~/shared/hooks/use-page-blocks/usePageBlocks', () => ({
  usePageBlocks: (...args: unknown[]) => usePageBlocksMock(...args)
}));

type CollapsibleBlockProps = { children: React.ReactNode; title: string };
jest.mock('~/ds-components/collapsible-block/CollapsibleBlock', () => ({
  __esModule: true,
  default: ({ children, title }: CollapsibleBlockProps) => (
    <section data-testid="collapsible-block">
      <h2>{title}</h2>
      {children}
    </section>
  )
}));

type ConfigurableListProps = {
  items: MissionPoint[];
  onChange: (item: MissionPoint) => void;
  onCreate: () => void;
  onDelete: (id: string | number) => void;
  renderItem: ({ item, onChange }: { item: MissionPoint; onChange: (item: MissionPoint) => void }) => React.ReactNode;
  addBtnLabel: string;
};
jest.mock('~/components/configurable-list/ConfigurableList', () => ({
  __esModule: true,
  default: ({ items, onChange, onCreate, onDelete, renderItem, addBtnLabel }: ConfigurableListProps) => (
    <div data-testid="configurable-list">
      {items.map((item) => (
        <div key={item.id} data-testid="configurable-list-item">
          {renderItem({ item, onChange })}
          <button data-testid="delete-btn" onClick={() => onDelete(item.id)}>
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

type TextFieldProps = {
  title: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};
jest.mock('~/ds-components/text-field/TextField', () => ({
  CustomTextField: ({ title, value, onChange }: TextFieldProps) => (
    <div data-testid={`textfield-${title}`}>
      <input value={value} onChange={onChange} data-testid={`input-${title}`} />
    </div>
  )
}));

type ImagePreviewBlockProps = { imageUrl: string; onChangeImage: (file: File) => void };
jest.mock('~/ds-components/photo-block/PhotoBlock', () => ({
  ImagePreviewBlock: ({ onChangeImage, imageUrl }: ImagePreviewBlockProps) => (
    <div data-testid="image-preview-block">
      <button onClick={() => onChangeImage(new File([''], 'test.png'))}>Upload Image</button>
      <span>{imageUrl}</span>
    </div>
  )
}));

beforeAll(() => {
  let counter = 0;
  crypto.randomUUID = jest.fn(() => `uuid-${counter++}`) as typeof crypto.randomUUID;
  URL.createObjectURL = jest.fn(() => 'mocked-url');
});

const mockBlocks: Record<string, unknown> = {
  [BLOCK_IDS.OUR_MISSION]: {
    title: { uk: 'Initial title' },
    list: [{ id: '1', value: 'Initial mission', uk: { type: 'doc', content: [] }, en: { type: 'doc', content: [] } }],
    smallImage: { src: 'small', generatedSrc: '', caption: { uk: 'caption', en: '' }, alt: { uk: '', en: '' } },
    bigImage: { src: 'big', generatedSrc: '', caption: { uk: 'caption', en: '' }, alt: { uk: '', en: '' } }
  }
};

describe('OurMission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePageBlocksMock.mockReturnValue({ blocks: mockBlocks });
  });

  it('should render collapsible block and title input', () => {
    render(<OurMission />);
    expect(screen.getByTestId('collapsible-block')).toBeInTheDocument();
    expect(screen.getByTestId('input-Заголовок секції')).toHaveValue('Initial title');
  });

  it('should call setField when section title changes', () => {
    render(<OurMission />);
    fireEvent.change(screen.getByTestId('input-Заголовок секції'), { target: { value: 'New title' } });
    expect(setFieldMock).toHaveBeenCalledWith(PAGE_IDS.ABOUT_US, BLOCK_IDS.OUR_MISSION, 'title', { uk: 'New title' });
  });

  it('should add and delete mission points', () => {
    render(<OurMission />);
    fireEvent.click(screen.getByTestId('add-btn'));
    expect(setFieldMock).toHaveBeenCalledWith(PAGE_IDS.ABOUT_US, BLOCK_IDS.OUR_MISSION, 'list', expect.any(Array));

    fireEvent.click(screen.getByTestId('delete-btn'));
    expect(setFieldMock).toHaveBeenCalledWith(PAGE_IDS.ABOUT_US, BLOCK_IDS.OUR_MISSION, 'list', expect.any(Array));
  });

  it('should change mission point value', () => {
    render(<OurMission />);
    const missionInput = screen.getByTestId('input-undefined');
    fireEvent.change(missionInput, { target: { value: 'Updated mission' } });
    expect(setFieldMock).toHaveBeenCalledWith(PAGE_IDS.ABOUT_US, BLOCK_IDS.OUR_MISSION, 'list', expect.any(Array));
  });

  it.each([0, 1])('should upload image file for image index %i', (index) => {
    render(<OurMission />);
    fireEvent.click(screen.getAllByText('Upload Image')[index]);
    expect(setFieldMock).toHaveBeenCalled();
  });
});
