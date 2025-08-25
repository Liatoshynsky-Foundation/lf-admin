import { fireEvent, render, screen } from '@testing-library/react';
import type { ChangeEvent } from 'react';

import type { MissionPoint } from './OurMission';
import OurMission from './OurMission';
import { BLOCK_IDS, PAGE_IDS } from '~/constants/pageBlocks';

const setFieldMock = jest.fn();
jest.mock('~/store', () => ({
  useStore: (selector: (s: { locale: 'uk'; setField: typeof setFieldMock }) => unknown) =>
    selector({ locale: 'uk', setField: setFieldMock })
}));

const usePageBlocksMock = jest.fn();
jest.mock('~/shared/hooks/use-page-blocks/usePageBlocks', () => ({
  usePageBlocks: (...args: unknown[]) => usePageBlocksMock(...args)
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
    onChange,
    onCreate,
    onDelete,
    renderItem,
    addBtnLabel
  }: {
    items: MissionPoint[];
    onChange: (item: MissionPoint) => void;
    onCreate: () => void;
    onDelete: (id: string | number) => void;
    renderItem: ({ item, onChange }: { item: MissionPoint; onChange: (item: MissionPoint) => void }) => React.ReactNode;
    addBtnLabel: string;
  }) => (
    <div data-testid="configurable-list">
      {items.map((item) => (
        <div key={item.id} data-testid="configurable-list-item">
          {renderItem({ item, onChange })}
          <button data-testid="delete-btn" onClick={() => onDelete?.(item.id)}>
            Delete
          </button>
        </div>
      ))}
      <button data-testid="add-btn" onClick={() => onCreate?.()}>
        {addBtnLabel}
      </button>
    </div>
  )
}));

jest.mock('~/ds-components/text-field/TextField', () => ({
  CustomTextField: ({
    title,
    value,
    onChange
  }: {
    title: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  }) => (
    <div data-testid={`textfield-${title}`}>
      <input value={value} onChange={onChange} data-testid={`input-${title}`} />
    </div>
  )
}));

jest.mock('~/ds-components/photo-block/PhotoBlock', () => ({
  ImagePreviewBlock: ({ imageUrl, onChangeImage }: { imageUrl: string; onChangeImage: (file: File) => void }) => (
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

describe('OurMission', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    usePageBlocksMock.mockReturnValue({
      blocks: {
        [BLOCK_IDS.OUR_MISSION]: {
          title: { uk: 'Initial title' },
          list: [
            { id: '1', value: 'Initial mission', uk: { type: 'doc', content: [] }, en: { type: 'doc', content: [] } }
          ],
          smallImage: { src: 'small', generatedSrc: '', caption: { uk: 'caption', en: '' }, alt: { uk: '', en: '' } },
          bigImage: { src: 'big', generatedSrc: '', caption: { uk: 'caption', en: '' }, alt: { uk: '', en: '' } }
        }
      }
    });
  });

  it('should render collapsible block and title input', () => {
    render(<OurMission />);
    expect(screen.getByTestId('collapsible-block')).toBeInTheDocument();
    expect(screen.getByTestId('input-Заголовок секції')).toHaveValue('Initial title');
  });

  it('should render add button', () => {
    render(<OurMission />);
    const addButton = screen.getByTestId('add-btn');
    expect(addButton).toBeInTheDocument();
    expect(addButton).toHaveTextContent('Додати пункт');
  });

  it('should add a mission point when add button clicked', () => {
    render(<OurMission />);
    fireEvent.click(screen.getByTestId('add-btn'));
    expect(setFieldMock).toHaveBeenCalledWith(PAGE_IDS.ABOUT_US, BLOCK_IDS.OUR_MISSION, 'list', expect.any(Array));
  });

  it('should upload image', () => {
    render(<OurMission />);
    fireEvent.click(screen.getAllByText('Upload Image')[0]);
    expect(setFieldMock).toHaveBeenCalled();
  });

  it('should delete mission point', () => {
    render(<OurMission />);
    const deleteBtn = screen.getByTestId('delete-btn');
    fireEvent.click(deleteBtn);
    expect(setFieldMock).toHaveBeenCalledWith(PAGE_IDS.ABOUT_US, BLOCK_IDS.OUR_MISSION, 'list', expect.any(Array));
  });
});
