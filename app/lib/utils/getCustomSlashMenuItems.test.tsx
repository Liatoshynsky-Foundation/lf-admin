import { getDefaultReactSlashMenuItems } from '@blocknote/react';
import React from 'react';

import { getCustomSlashMenuItems } from './getCustomSlashMenuItems';
import { StrictBlockNoteEditor } from '~/shared/components/content-editor/types';
import { MediaModalResult } from '~/shared/components/media-modal/MediaModal.types';
import { CropResult } from '~/types/common';

type MockSlashMenuItem = {
  title: string;
  group: string;
  aliases?: string[];
  icon?: React.ReactNode;
  subtext?: string;
  onItemClick?: () => Promise<void>;
};

jest.mock('@blocknote/react', () => ({
  getDefaultReactSlashMenuItems: jest.fn()
}));

jest.mock('lucide-react', () => ({
  ImageIcon: () => <span data-testid="image-icon" />
}));

const mockInsertBlocks = jest.fn();
const mockGetTextCursorPosition = jest.fn(() => ({ block: { id: 'mock-block-id' } }));

const mockEditor = {
  getTextCursorPosition: mockGetTextCursorPosition,
  insertBlocks: mockInsertBlocks
} as unknown as StrictBlockNoteEditor;

describe('getCustomSlashMenuItems', () => {
  const mockOpenMediaModal = jest.fn<Promise<MediaModalResult | null>, []>();

  beforeEach(() => {
    jest.clearAllMocks();

    (getDefaultReactSlashMenuItems as jest.Mock).mockReturnValue([
      { title: 'Heading 1', group: 'Text', aliases: ['h1'] },
      { title: 'Image', group: 'Media', aliases: ['img'] }, 
      { title: 'Video', group: 'Media', aliases: ['vid'] }, 
      { title: 'Divider', group: 'Media', aliases: ['line'] }, 
      { title: 'File', group: 'Media', aliases: [] }, 
      { title: 'List', group: 'Text', aliases: ['ul'] }
    ] as MockSlashMenuItem[]);
  });

  describe('Menu Composition and Filtering', () => {
    it('should exclude forbidden titles and inject the custom "Picture" item', () => {
      const items = getCustomSlashMenuItems(mockEditor, '', mockOpenMediaModal);

      const titles = items.map((item) => item.title);

      expect(titles).not.toContain('Image');
      expect(titles).not.toContain('Video');
      expect(titles).not.toContain('File');
      
      expect(titles).toContain('Picture');
      expect(titles).toContain('Heading 1');
      expect(titles).toContain('List');
    });

    it('should insert the custom "Picture" item into the Media group', () => {
      const items = getCustomSlashMenuItems(mockEditor, '', mockOpenMediaModal);
      const pictureItem = items.find((item) => item.title === 'Picture');

      expect(pictureItem).toBeDefined();
      expect(pictureItem?.group).toBe('Media');
      expect(pictureItem?.aliases).toContain('photo');
    });

    it('should filter items based on the query matching the title', () => {
      const items = getCustomSlashMenuItems(mockEditor, 'head', mockOpenMediaModal);
      
      expect(items).toHaveLength(1);
      expect(items[0].title).toBe('Heading 1');
    });

    it('should filter items based on the query matching an alias', () => {
      const items = getCustomSlashMenuItems(mockEditor, 'ul', mockOpenMediaModal);
      
      expect(items).toHaveLength(1);
      expect(items[0].title).toBe('List');
    });

    it('should return the custom Picture item if queried by its aliases', () => {
      const items = getCustomSlashMenuItems(mockEditor, 'зображення', mockOpenMediaModal);
      
      expect(items).toHaveLength(1);
      expect(items[0].title).toBe('Picture');
    });

    it('should return an empty array if query matches nothing', () => {
      const items = getCustomSlashMenuItems(mockEditor, 'nonexistentquery', mockOpenMediaModal);
      
      expect(items).toHaveLength(0);
    });
  });

  describe('Interaction & Modal Flow (onItemClick)', () => {
    let pictureItemOnClick: () => Promise<void>;

    beforeEach(() => {
      const items = getCustomSlashMenuItems(mockEditor, 'picture', mockOpenMediaModal) as MockSlashMenuItem[];
      pictureItemOnClick = items[0].onItemClick!;
    });

    it('should not insert blocks if the modal is cancelled (returns null)', async () => {
      mockOpenMediaModal.mockResolvedValue(null);

      await pictureItemOnClick();

      expect(mockOpenMediaModal).toHaveBeenCalledTimes(1);
      expect(mockInsertBlocks).not.toHaveBeenCalled();
    });

    it('should not insert blocks if the modal returns an upload without a valid URL', async () => {
      const mockResult: MediaModalResult = {
        selected: { 
          kind: 'upload', 
          id: 'up-1', 
          fileName: 'err.jpg', 
          file: new File([], 'err.jpg') 
        },
        crop: null,
        uploadResult: undefined 
      };
      
      mockOpenMediaModal.mockResolvedValue(mockResult);

      await pictureItemOnClick();

      expect(mockInsertBlocks).not.toHaveBeenCalled();
    });

    it('should insert a image block when an uploaded image is successfully returned', async () => {
      const mockResult: MediaModalResult = {
        selected: { 
          kind: 'upload', 
          id: 'up-2', 
          fileName: 'my-uploaded-file.jpg', 
          file: new File([], 'my-uploaded-file.jpg') 
        },
        crop: { width: 500, height: 500, x: 10, y: 10 } as unknown as  CropResult,
        uploadResult: { 
          url: 'https://example.com/uploaded.jpg',
          filename: 'hash-name.jpg',
          originalName: 'my-uploaded-file.jpg',
          mimeType: 'image/jpeg',
          size: 1024
        }
      };
      
      mockOpenMediaModal.mockResolvedValue(mockResult);

      await pictureItemOnClick();

      expect(mockGetTextCursorPosition).toHaveBeenCalled();
      expect(mockInsertBlocks).toHaveBeenCalledWith(
        [
          {
            type: 'image',
            props: {
              url: 'https://example.com/uploaded.jpg',
              cropData: JSON.stringify({ width: 500, height: 500, x: 10, y: 10 }),
              fileName: 'my-uploaded-file.jpg'
            }
          }
        ],
        { id: 'mock-block-id' },
        'after'
      );
    });

    it('should insert a image block when a gallery/library image is selected', async () => {
      const mockResult: MediaModalResult = {
        selected: { 
          kind: 'gallery', 
          id: 'gal-1', 
          src: 'https://example.com/gallery-img.png', 
          fileName: 'gallery-pic.png',
          locale: 'en'
        },
        crop: null, 
        uploadResult: undefined
      };
      
      mockOpenMediaModal.mockResolvedValue(mockResult);

      await pictureItemOnClick();

      expect(mockInsertBlocks).toHaveBeenCalledWith(
        [
          {
            type: 'image',
            props: {
              url: 'https://example.com/gallery-img.png',
              cropData: '{}', 
              fileName: 'gallery-pic.png'
            }
          }
        ],
        { id: 'mock-block-id' },
        'after'
      );
    });

    it('should fallback to "image" if fileName is falsy', async () => {
      const mockResult: MediaModalResult = {
        selected: { 
          kind: 'used', 
          id: 'usd-1', 
          src: 'https://example.com/no-name.png', 
          fileName: '', 
          locale: 'uk'
        },
        crop: null,
        uploadResult: undefined
      };
      
      mockOpenMediaModal.mockResolvedValue(mockResult);

      await pictureItemOnClick();

      expect(mockInsertBlocks).toHaveBeenCalledWith(
        expect.any(Array),
        { id: 'mock-block-id' },
        'after'
      );

      const insertedProps = mockInsertBlocks.mock.calls[0][0][0].props;
      expect(insertedProps.fileName).toBe('image');
    });
  });
});
