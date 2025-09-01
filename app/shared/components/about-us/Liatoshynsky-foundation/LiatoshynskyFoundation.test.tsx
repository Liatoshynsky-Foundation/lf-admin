import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { LiatoshynskyFoundation } from './LiatoshynskyFoundation';

const setFieldMock = jest.fn();
const handleUploadImageMock = jest.fn();
const useUploadBlobMutationMock = jest.fn();

jest.mock('~/store', () => ({
  useStore: (selector: (state: { locale: 'uk'; setField: typeof setFieldMock }) => void) =>
    selector({ locale: 'uk', setField: setFieldMock })
}));

const usePageBlockMock = jest.fn();
jest.mock('~/shared/hooks/use-page-block/usePageBlock', () => ({
  usePageBlock: (pageId: string, blockId: string) => usePageBlockMock(pageId, blockId)
}));

jest.mock('~/utils/uploadToTmpFolder', () => ({
  handleUploadImage: (...args: any[]) => handleUploadImageMock(...args)
}));

jest.mock('~/types/graphql/generated/graphql', () => ({
  useUploadBlobMutation: () => [useUploadBlobMutationMock]
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
  onImageChange: (file: File) => void;
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
      {paragraphs.map((p: any, idx: number) => (
        <input
          key={`${p.text}-${idx}`}
          data-testid={`paragraph-${idx}`}
          value={p.text}
          onChange={(e) => onParagraphChange(idx, e.target.value)}
        />
      ))}
      <img src={imageUrl} alt="Foundation" data-testid="image" />
      <span data-testid="file-name">{fileName}</span>
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

  const renderFoundation = () => render(<LiatoshynskyFoundation />);

  beforeEach(() => {
    jest.clearAllMocks();
    usePageBlockMock.mockReturnValue({ block: mockBlock, blockId: 'FoundationInfo' });
  });

  it('should render all fields when block exists', () => {
    renderFoundation();
    expect(screen.getByTestId('main-text')).toHaveValue('Organisation Text');
    expect(screen.getByTestId('paragraph-0')).toHaveValue('Name');
    expect(screen.getByTestId('paragraph-1')).toHaveValue('Belief');

    expect(screen.getByTestId('image')).toHaveAttribute('src', '/api/blob-url?folderName=photos&blobName=image-src');

    expect(screen.getByTestId('file-name')).toHaveTextContent('Image Caption');
  });

  it('should update main text when edited', () => {
    renderFoundation();
    fireEvent.change(screen.getByTestId('main-text'), { target: { value: 'New Organisation Text' } });

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
    renderFoundation();
    fireEvent.change(screen.getByTestId('paragraph-0'), { target: { value: 'New Name' } });

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

  it('should call handleUploadImage when a new file is uploaded', () => {
    renderFoundation();
    const file = new File(['test'], 'new-image.png', { type: 'image/png' });

    fireEvent.change(screen.getByTestId('image-input'), { target: { files: [file] } });

    expect(handleUploadImageMock).toHaveBeenCalledWith(
      file,
      'about-us',
      'FoundationInfo',
      'tmp',
      'image',
      useUploadBlobMutationMock
    );
  });
});
