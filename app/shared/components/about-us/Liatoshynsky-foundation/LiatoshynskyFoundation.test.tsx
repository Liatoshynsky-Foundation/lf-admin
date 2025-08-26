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

jest.mock('./foundation-block/FoundationBlock', () => ({
  FoundationBlock: ({
    mainText,
    paragraphs,
    imageUrl,
    onMainTextChange,
    onParagraphChange,
    onImageChange
  }: {
    mainText: string;
    paragraphs: { text: string }[];
    imageUrl: string;
    onMainTextChange: (val: string) => void;
    onParagraphChange: (index: number, val: string) => void;
    onImageChange: (file: File) => void;
  }) => (
    <div>
      <input data-testid="main-text" value={mainText} onChange={(e) => onMainTextChange(e.target.value)} />
      {paragraphs.map((p, idx) => (
        <input
          key={idx}
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

  beforeEach(() => {
    jest.clearAllMocks();
    usePageBlockMock.mockReturnValue({ block: mockBlock, blockId: 'FoundationInfo' });
  });

  it('should render all fields when block exists', () => {
    render(<LiatoshynskyFoundation />);

    expect(screen.getByTestId('main-text')).toHaveValue('Organisation Text');
    expect(screen.getByTestId('paragraph-0')).toHaveValue('Name');
    expect(screen.getByTestId('paragraph-1')).toHaveValue('Belief');
    expect(screen.getByTestId('image')).toHaveAttribute('src', '/images/image-src.png');
  });

  it('should update main text when edited', () => {
    render(<LiatoshynskyFoundation />);

    const mainTextInput = screen.getByTestId('main-text');
    fireEvent.change(mainTextInput, { target: { value: 'New Organisation Text' } });

    expect(setFieldMock).toHaveBeenCalledWith(
      'about-us',
      'FoundationInfo',
      'ourOrganisation',
      expect.objectContaining({
        uk: {
          type: 'doc',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'New Organisation Text' }] }]
        }
      })
    );
  });

  it('should update paragraph when edited', () => {
    render(<LiatoshynskyFoundation />);

    const paragraphInput = screen.getByTestId('paragraph-0');
    fireEvent.change(paragraphInput, { target: { value: 'New Name' } });

    expect(setFieldMock).toHaveBeenCalledWith(
      'about-us',
      'FoundationInfo',
      'ourName',
      expect.objectContaining({
        uk: {
          type: 'doc',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'New Name' }] }]
        }
      })
    );
  });

  it('should update image when a new file is uploaded', () => {
    render(<LiatoshynskyFoundation />);

    const fileInput = screen.getByTestId('image-input');
    const file = new File(['test'], 'new-image.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(setFieldMock).toHaveBeenCalledWith(
      'about-us',
      'FoundationInfo',
      'image',
      expect.objectContaining({
        src: 'mock-url/new-image.png',
        generatedSrc: 'mock-url/new-image.png',
        caption: { uk: 'Image Caption' }
      })
    );
  });
});
