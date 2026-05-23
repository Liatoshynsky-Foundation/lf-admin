/* eslint-disable @next/next/no-img-element */
import { fireEvent, render, screen } from '@testing-library/react';
import { JSONContent } from '@tiptap/react';
import React from 'react';

import { LiatoshynskyFoundation } from './LiatoshynskyFoundation';
import { CropRect } from '~/types/graphql/generated/graphql';

interface MockParagraph {
  readonly text: JSONContent;
}

interface MockFoundationBlockProps {
  readonly mainText: JSONContent;
  readonly paragraphs: readonly MockParagraph[];
  readonly imageUrl: string;
  readonly fileName: string;
  readonly onMainTextChange: (value: JSONContent) => void;
  readonly onParagraphChange: (idx: number, value: JSONContent) => void;
  readonly onImageChange: (url: string, crop?: CropRect) => void;
}

const setFieldMock = jest.fn();

jest.mock('~/store', () => ({
  useStore: (selector: (state: { readonly locale: 'uk'; readonly setField: typeof setFieldMock }) => unknown) =>
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
    fileName,
    onMainTextChange,
    onParagraphChange,
    onImageChange
  }: MockFoundationBlockProps) => (
    <div>
      <div data-testid="main-text-json">{JSON.stringify(mainText)}</div>
      <button
        data-testid="trigger-main-text-change"
        onClick={() => {
          const updatedJson: JSONContent = {
            type: 'doc',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'New Organisation Text' }] }]
          };
          onMainTextChange(updatedJson);
        }}
      >
        Change Main Text
      </button>

      {paragraphs.map((p, idx) => (
        <div key={idx} data-testid={`paragraph-wrapper-${idx}`}>
          <div data-testid={`paragraph-json-${idx}`}>{JSON.stringify(p.text)}</div>
          <button
            data-testid={`trigger-paragraph-change-${idx}`}
            onClick={() => {
              const textMap = ['New Name', 'New Belief'];
              const updatedJson: JSONContent = {
                type: 'doc',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: textMap[idx] || 'New Text' }] }]
              };
              onParagraphChange(idx, updatedJson);
            }}
          >
            Change Paragraph {idx}
          </button>
        </div>
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
  default: ({ children, title }: { readonly children: React.ReactNode; readonly title: string }) => (
    <div data-testid="collapsible-block">
      <h2>{title}</h2>
      {children}
    </div>
  )
}));

jest.mock('~/lib/utils/prose', () => ({
  proseToText: (input: unknown) => String(input)
}));

const orgTextMock: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Organisation Text' }] }]
};

const nameTextMock: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Name' }] }]
};

const beliefTextMock: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Belief' }] }]
};

const mockBlock = {
  ourOrganisation: { uk: orgTextMock },
  ourName: { uk: nameTextMock },
  ourBelief: { uk: beliefTextMock },
  image: { src: 'image-src', caption: { uk: 'Image Caption' } }
};

describe('LiatoshynskyFoundation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePageBlockMock.mockReturnValue({ block: mockBlock, blockId: 'FoundationInfo' });
    render(<LiatoshynskyFoundation />);
  });

  it('should render all rich text fields with serialized JSON initial values', () => {
    expect(screen.getByTestId('main-text-json')).toHaveTextContent(JSON.stringify(orgTextMock));
    expect(screen.getByTestId('paragraph-json-0')).toHaveTextContent(JSON.stringify(nameTextMock));
    expect(screen.getByTestId('paragraph-json-1')).toHaveTextContent(JSON.stringify(beliefTextMock));
    
    expect(screen.getByTestId('image')).toHaveAttribute(
      'src', 
      '/api/blob-url?folderName=photos&blobName=image-src'
    );
    expect(screen.getByTestId('file-name')).toHaveTextContent('Image Caption');
  });

  describe('when executing text field updating matrices', () => {
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

    it('should pass type-safe structural JSON states to store when main section changes', () => {
      fireEvent.click(screen.getByTestId('trigger-main-text-change'));
      expectSetFieldMockToHaveBeenCalledWith('ourOrganisation', 'New Organisation Text');
    });

    it('should pass type-safe structural JSON states to store when paragraph collections change', () => {
      fireEvent.click(screen.getByTestId('trigger-paragraph-change-0'));
      expectSetFieldMockToHaveBeenCalledWith('ourName', 'New Name');

      fireEvent.click(screen.getByTestId('trigger-paragraph-change-1'));
      expectSetFieldMockToHaveBeenCalledWith('ourBelief', 'New Belief');
    });
  });

  it('should update store schema options when onImageChange execution hook runs', () => {
    fireEvent.click(screen.getByTestId('trigger-image-change'));

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
