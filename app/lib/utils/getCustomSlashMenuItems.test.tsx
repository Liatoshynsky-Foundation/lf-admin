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
    it('should exclude the entire original "Media" group and inject the custom "Picture" item', () => {
      const items = getCustomSlashMenuItems(mockEditor, '', mockOpenMediaModal);
      const titles = items.map((item) => item.title);

      expect(titles).not.toContain('Image');
      expect(titles).not.toContain('Video');
      expect(titles).not.toContain('File');
      expect(titles).not.toContain('Divider');
      
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

    describe('Query Filtering', () => {
      const testCases = [
        {
          scenario: 'filter items based on the query matching the title',
          query: 'head',
          expectedLength: 1,
          expectedTitle: 'Heading 1'
        },
        {
          scenario: 'filter items based on the query matching an alias',
          query: 'ul',
          expectedLength: 1,
          expectedTitle: 'List'
        },
        {
          scenario: 'return the custom Picture item if queried by its aliases',
          query: 'зображення',
          expectedLength: 1,
          expectedTitle: 'Picture'
        },
        {
          scenario: 'return an empty array if query matches nothing',
          query: 'nonexistentquery',
          expectedLength: 0,
          expectedTitle: undefined
        }
      ];

      it.each(testCases)('should $scenario', ({ query, expectedLength, expectedTitle }) => {
        const items = getCustomSlashMenuItems(mockEditor, query, mockOpenMediaModal);
        
        expect(items).toHaveLength(expectedLength);
        
        if (expectedLength > 0) {
          expect(items[0].title).toBe(expectedTitle);
        }
      });
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

    const triggerClick = async (result: MediaModalResult | null) => {
      mockOpenMediaModal.mockResolvedValue(result);
      await pictureItemOnClick();
    };

    const expectNoInsert = async (result: MediaModalResult | null) => {
      await triggerClick(result);
      expect(mockInsertBlocks).not.toHaveBeenCalled();
    };

    const expectInsert = async (result: MediaModalResult, expectedProps: Record<string, unknown>) => {
      await triggerClick(result);
      expect(mockGetTextCursorPosition).toHaveBeenCalled();
      expect(mockInsertBlocks).toHaveBeenCalledWith(
        [{ type: 'image', props: expectedProps }],
        { id: 'mock-block-id' },
        'after'
      );
    };

    it('should not insert blocks if the modal is cancelled (returns null)', async () => {
      await expectNoInsert(null);
      expect(mockOpenMediaModal).toHaveBeenCalledTimes(1);
    });

    it('should not insert blocks if the modal returns an upload without a valid uploadResult', async () => {
      await expectNoInsert({
        selected: { kind: 'upload', id: 'up-1', fileName: 'err.jpg', file: new File([], 'err.jpg') },
        crop: null,
        uploadResult: undefined 
      });
    });

    it('should insert an image block when an uploaded image is successfully returned', async () => {
      await expectInsert({
        selected: { kind: 'upload', id: 'up-2', fileName: 'my-uploaded-file.jpg', file: new File([], 'my-uploaded-file.jpg') },
        crop: { width: 500, height: 500, x: 10, y: 10 } as unknown as CropResult,
        uploadResult: { url: 'https://example.com/uploaded.jpg', filename: 'hash-name.jpg', originalName: 'my-uploaded-file.jpg', mimeType: 'image/jpeg', size: 1024 }
      }, {
        url: 'https://example.com/uploaded.jpg',
        cropData: JSON.stringify({ width: 500, height: 500, x: 10, y: 10 }),
        fileName: 'my-uploaded-file.jpg'
      });
    });

    it('should insert an image block when a gallery/library image is selected', async () => {
      await expectInsert({
        selected: { kind: 'gallery', id: 'gal-1', src: 'https://example.com/gallery-img.png', fileName: 'gallery-pic.png', locale: 'en' },
        crop: null, 
        uploadResult: undefined
      }, {
        url: 'https://example.com/gallery-img.png',
        cropData: '{}', 
        fileName: 'gallery-pic.png'
      });
    });

    it('should fallback to "image" if fileName is falsy', async () => {
      await expectInsert({
        selected: { kind: 'used', id: 'usd-1', src: 'https://example.com/no-name.png', fileName: '', locale: 'uk' },
        crop: null,
        uploadResult: undefined
      }, {
        url: 'https://example.com/no-name.png',
        cropData: '{}',
        fileName: 'image'
      });
    });
  });
});
