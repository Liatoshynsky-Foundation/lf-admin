import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import FileCard from './FileCard';

const FALLBACK_IMAGE_SRC = 'https://pub-2b50c59c64954ab89b7837f9f4607e12.r2.dev/photos/about-us-foundation-first.png';

const meta = {
  title: 'Shared/FileCard',
  component: FileCard,
  tags: ['autodocs'],
  argTypes: {
    fileType: {
      control: 'radio',
      options: ['image', 'audio', 'pdf', 'document', 'spreadsheet', 'video', 'archive'],
    },
    fileData: {
      control: false,
    },
    onClick: {
      control: false,
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Shared media library card for files with preview, type-specific iconography, starred state, and usage counters.'
      }
    }
  },
  decorators: [
    (Story) => (
      <div style={{ width: '301px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FileCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ImageFile: Story = {
  args: {
    fileType: 'image',
    fileData: {
      id: 'file-1',
      name: 'concert-photo.jpg',
      dateAdded: '15.01.2025',
      imageSrc: FALLBACK_IMAGE_SRC,
      isStarred: false,
      usageLinks: 3,
    },
    onClick: fn(),
  },
};

export const AudioFile: Story = {
  args: {
    fileType: 'audio',
    fileData: {
      id: 'file-2',
      name: 'symphony-no-3.mp3',
      dateAdded: '20.02.2025',
      isStarred: true,
      usageLinks: 1,
    },
    onClick: fn(),
  },
};

export const PdfDocument: Story = {
  args: {
    fileType: 'pdf',
    fileData: {
      id: 'file-3',
      name: 'program-2025.pdf',
      dateAdded: '10.03.2025',
      isStarred: false,
      usageLinks: 0,
    },
    onClick: fn(),
  },
};

export const VideoFile: Story = {
  args: {
    fileType: 'video',
    fileData: {
      id: 'file-4',
      name: 'interview.mp4',
      dateAdded: '05.04.2025',
      isStarred: true,
      usageLinks: 2,
    },
    onClick: fn(),
  },
};

export const StarredImage: Story = {
  args: {
    fileType: 'image',
    fileData: {
      id: 'file-5',
      name: 'starred-photo.png',
      dateAdded: '01.01.2025',
      imageSrc: FALLBACK_IMAGE_SRC,
      isStarred: true,
      usageLinks: 5,
    },
    onClick: fn(),
  },
};
