/* eslint-disable @next/next/no-img-element */
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { LiatoshynskyFoundation } from './LiatoshynskyFoundation';

const setFieldMock = jest.fn();

jest.mock('~/store', () => ({
  useStore: (selector: (state: { locale: 'uk'; setField: typeof setFieldMock }) => void) =>
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
  fileName: string;
  onMainTextChange: (value: string) => void;
  onParagraphChange: (idx: number, value: string) => void;
  onImageChange: (url: string, crop?: { x: number; y: number; width: number; height: number }) => void;
}

jest.mock('./foundation-block/FoundationBlock', () => ({
  FoundationBlock: ({
    mainText,
    paragraphs,
    imageUrl,
    fileName,
    onMainTextChange,
    onParagraphChange,
    onImageChange
  }: FoundationBlockProps) => (
    <div>
      <input data-testid="main-text" value={mainText} onChange={(e) => onMainTextChange(e.target.value)} />
      {paragraphs.map((p: Paragraph, idx: number) => (
        <input
          key={`${p.text}-${idx}`}
          data-testid={`paragraph-${idx}`}
          value={p.text}
          onChange={(e) => onParagraphChange(idx, e.target.value)}
        />
      ))}
      <img src={imageUrl} alt="Foundation" data-testid="image" />
      <span data-testid="file-name">{fileName}</span>
      <button
        data-testid="trigger-image-change"
        onClick={() => onImageChange('new-image-url.jpg', { x: 0, y: 0, width: 100, height: 100 })}
      >
          Change Image
      </button>
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

describe('LiatoshynskyFoundation', () => {
  const mockBlock = {
    ourOrganisation: {
      uk: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Organisation Text' }] }] }
    },
    ourName: {
      uk: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Name' }] }] }
    },
    ourBelief: {
      uk: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Belief' }] }] }
    },
    image: { src: 'image-src', caption: { uk: 'Image Caption' } }
  };

  let mainTextInput: HTMLElement;
  let paragraph0Input: HTMLElement;
  let paragraph1Input: HTMLElement;
  let image: HTMLElement;
  let fileNameSpan: HTMLElement;

  beforeEach(() => {
    jest.clearAllMocks();
    usePageBlockMock.mockReturnValue({ block: mockBlock, blockId: 'FoundationInfo' });

    render(<LiatoshynskyFoundation />);

    mainTextInput = screen.getByTestId('main-text');
    paragraph0Input = screen.getByTestId('paragraph-0');
    paragraph1Input = screen.getByTestId('paragraph-1');
    image = screen.getByTestId('image');
    fileNameSpan = screen.getByTestId('file-name');
  });

  it('should render all fields with initial data from the block', () => {
    expect(mainTextInput).toHaveValue('Organisation Text');
    expect(paragraph0Input).toHaveValue('Name');
    expect(paragraph1Input).toHaveValue('Belief');
    expect(image).toHaveAttribute('src', '/api/blob-url?folderName=photos&blobName=image-src');
    expect(fileNameSpan).toHaveTextContent('Image Caption');
  });

  describe('when updating text fields', () => {
    const expectSetFieldMockToHaveBeenCalledWith = (fieldId: string, text: string) => {
      const expectedPayload = {
        uk: {
          type: 'doc',
          content: [{ type: 'paragraph', content: [{ type: 'text', text }] }]
        }
      };
      expect(setFieldMock).toHaveBeenCalledWith(
        'about-us',
        'FoundationInfo',
        fieldId,
        expect.objectContaining(expectedPayload)
      );
    };

    const testCases = [
      {
        description: 'main text',
        element: () => mainTextInput,
        newValue: 'New Organisation Text',
        fieldId: 'ourOrganisation'
      },
      {
        description: 'first paragraph',
        element: () => paragraph0Input,
        newValue: 'New Name',
        fieldId: 'ourName'
      }
    ];

    it.each(testCases)('should update the store when the $description is edited', ({ element, newValue, fieldId }) => {
      fireEvent.change(element(), { target: { value: newValue } });
      expectSetFieldMockToHaveBeenCalledWith(fieldId, newValue);
    });
  });

  it('should update store when onImageChange is called', () => {
    const trigger = screen.getByTestId('trigger-image-change');

    fireEvent.click(trigger);

    expect(setFieldMock).toHaveBeenCalledWith(
      'about-us',
      'FoundationInfo',
      'image',
      expect.objectContaining({
        src: 'new-image-url.jpg',
        isTmp: false,
        crop: { x: 0, y: 0, width: 100, height: 100 }
      })
    );
  });
});
