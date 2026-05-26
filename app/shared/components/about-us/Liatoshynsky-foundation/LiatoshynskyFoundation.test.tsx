import { fireEvent, render, screen } from '@testing-library/react';
import { JSONContent } from '@tiptap/react';
import React from 'react';

import { createDocNode } from '../__mocks__/utils';
import { LiatoshynskyFoundation } from './LiatoshynskyFoundation';
import { CropRect } from '~/types/graphql/generated/graphql';

interface MockParagraph {
  readonly id?: string;
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
const usePageBlockMock = jest.fn();

jest.mock('~/store', () => ({
  useStore: (selector: (state: { readonly locale: 'uk'; readonly setField: typeof setFieldMock }) => unknown) =>
    selector({ locale: 'uk', setField: setFieldMock })
}));

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
      <button data-testid="trigger-main-text-change" onClick={() => onMainTextChange(createDocNode('New Organisation Text'))}>
        Change Main Text
      </button>

      {paragraphs.map((p, idx) => {
        const stableId = p.id || `para-${idx}`;
        
        return (
          <div key={stableId} data-testid={`paragraph-wrapper-${stableId}`}>
            <div data-testid={`paragraph-json-${stableId}`}>{JSON.stringify(p.text)}</div>
            <button
              data-testid={`trigger-paragraph-change-${stableId}`}
              onClick={() => {
                const textMap = ['New Name', 'New Belief'];
                onParagraphChange(idx, createDocNode(textMap[idx] || 'New Text'));
              }}
            >
              Change Paragraph {stableId}
            </button>
          </div>
        );
      })}

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

jest.mock('~/ds-components/collapsible-block/CollapsibleBlock');

jest.mock('~/lib/utils/prose', () => ({ proseToText: String }));

const mockNodes = {
  org: createDocNode('Organisation Text'),
  name: createDocNode('Name'),
  belief: createDocNode('Belief')
};

const mockBlock = {
  ourOrganisation: { uk: mockNodes.org },
  ourName: { uk: mockNodes.name },
  ourBelief: { uk: mockNodes.belief },
  image: { src: 'image-src', caption: { uk: 'Image Caption' } }
};

describe('LiatoshynskyFoundation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePageBlockMock.mockReturnValue({ block: mockBlock, blockId: 'FoundationInfo' });
    render(<LiatoshynskyFoundation />);
  });

  it('should render all rich text fields with serialized JSON initial values and image source props', () => {
    expect(screen.getByTestId('main-text-json')).toHaveTextContent(JSON.stringify(mockNodes.org));
    
    expect(screen.getByTestId('paragraph-json-para-0')).toHaveTextContent(JSON.stringify(mockNodes.name));
    expect(screen.getByTestId('paragraph-json-para-1')).toHaveTextContent(JSON.stringify(mockNodes.belief));
    
    expect(screen.getByTestId('image')).toHaveAttribute('src', '/api/blob-url?folderName=photos&blobName=image-src');
    expect(screen.getByTestId('file-name')).toHaveTextContent('Image Caption');
  });

  it.each([
    [
      'main organization text sections',
      'trigger-main-text-change',
      'ourOrganisation',
      expect.objectContaining({ uk: createDocNode('New Organisation Text') })
    ],
    [
      'first paragraph (Name) collections',
      'trigger-paragraph-change-para-0',
      'ourName',
      expect.objectContaining({ uk: createDocNode('New Name') })
    ],
    [
      'second paragraph (Belief) collections',
      'trigger-paragraph-change-para-1',
      'ourBelief',
      expect.objectContaining({ uk: createDocNode('New Belief') })
    ],
    [
      'image source assets and crop layouts',
      'trigger-image-change',
      'image',
      expect.objectContaining({ src: 'new-image-url.jpg', isTmp: false, crop: { x: 0, y: 0, width: 100, height: 100 } })
    ]
  ])(
    'should correctly dispatch setField parameters when modifying %s',
    (_scenario, triggerId, storeKey, expectedPayload) => {
      fireEvent.click(screen.getByTestId(triggerId));

      expect(setFieldMock).toHaveBeenCalledWith(
        'about-us',
        'FoundationInfo',
        storeKey,
        expectedPayload
      );
    }
  );
});
