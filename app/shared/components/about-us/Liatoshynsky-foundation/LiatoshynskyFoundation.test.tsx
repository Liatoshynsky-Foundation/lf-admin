import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { LiatoshynskyFoundation } from './LiatoshynskyFoundation';

const setFieldMock = jest.fn();

jest.mock('~/store', () => ({
  useStore: (selector: (state: { locale: string; setField: typeof setFieldMock }) => void) =>
    selector({ locale: 'uk', setField: setFieldMock })
}));

const usePageBlockMock = jest.fn();
jest.mock('~/shared/hooks/use-page-block/usePageBlock', () => ({
  usePageBlock: (pageId: string, blockId: string) => usePageBlockMock(pageId, blockId)
}));

interface Paragraph {
  text: string;
}

interface FoundationBlockProps {
  mainText: string;
  paragraphs: Paragraph[];
  imageUrl: string;
  onMainTextChange: (value: string) => void;
  onParagraphChange: (idx: number, value: string) => void;
  onImageChange: (file: File) => void;
}

jest.mock('./foundation-block/FoundationBlock', () => ({
  FoundationBlock: ({
    mainText,
    paragraphs,
    imageUrl,
    onMainTextChange,
    onParagraphChange,
    onImageChange
  }: FoundationBlockProps) => (
    <div>
      <input data-testid="main-text" value={mainText} onChange={(e) => onMainTextChange(e.target.value)} />
      {paragraphs.map((p, idx) => (
        <input
          key={`${p.text}-${idx}`}
          data-testid={`paragraph-${idx}`}
          value={p.text}
          onChange={(e) => onParagraphChange(idx, e.target.value)}
        />
      ))}
      <img src={imageUrl} alt="Foundation" data-testid="image" />
      <input
        type="file"
        data-testid="image-input"
        onChange={(e) => e.target.files && onImageChange(e.target.files[0])}
      />
    </div>
  )
}));

jest.mock('~/ds-components/collapsible-block/CollapsibleBlock', () => ({
  __esModule: true,
  default: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div data-testid="collapsible-block">
      <h2>{title}</h2>
      {children}
    </div>
  )
}));

global.URL.createObjectURL = jest.fn((file: File) => `mock-url/${file.name}`);

describe('LiatoshynskyFoundation', () => {
  const mockBlock = {
    ourOrganisation: {
      uk: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Organisation Text' }] }] }
    },
    ourName: { uk: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Name' }] }] } },
    ourBelief: { uk: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Belief' }] }] } },
    image: { src: 'image-src', caption: { uk: 'Image Caption' } }
  };

  const renderFoundation = () => render(<LiatoshynskyFoundation />);

  const expectSetFieldCalled = (field: string, content: object) => {
    expect(setFieldMock).toHaveBeenCalledWith(
      'about-us',
      'FoundationInfo',
      field,
      expect.objectContaining({ uk: expect.objectContaining(content) })
    );
  };

  const changeInputAndExpect = (testId: string, value: string, field: string) => {
    fireEvent.change(screen.getByTestId(testId), { target: { value } });
    expectSetFieldCalled(field, {
      content: [{ type: 'paragraph', content: [{ type: 'text', text: value }] }]
    });
  };

  const uploadFileAndExpect = (file: File, field: string, caption = 'Image Caption') => {
    fireEvent.change(screen.getByTestId('image-input'), { target: { files: [file] } });
    expect(setFieldMock).toHaveBeenCalledWith(
      'about-us',
      'FoundationInfo',
      field,
      expect.objectContaining({
        src: `mock-url/${file.name}`,
        generatedSrc: `mock-url/${file.name}`,
        caption: { uk: caption }
      })
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    usePageBlockMock.mockReturnValue({ block: mockBlock, blockId: 'FoundationInfo' });
  });

  it('should render all fields when block exists', () => {
    renderFoundation();
    expect(screen.getByTestId('main-text')).toHaveValue('Organisation Text');

    ['Name', 'Belief'].forEach((val, idx) => {
      expect(screen.getByTestId(`paragraph-${idx}`)).toHaveValue(val);
    });

    expect(screen.getByTestId('image')).toHaveAttribute('src', '/images/image-src.png');
  });

  it('should update main text when edited', () => {
    renderFoundation();
    changeInputAndExpect('main-text', 'New Organisation Text', 'ourOrganisation');
  });

  it('should update paragraph when edited', () => {
    renderFoundation();
    changeInputAndExpect('paragraph-0', 'New Name', 'ourName');
  });

  it('should update image when a new file is uploaded', () => {
    renderFoundation();
    const file = new File(['test'], 'new-image.png', { type: 'image/png' });
    uploadFileAndExpect(file, 'image');
  });
});
