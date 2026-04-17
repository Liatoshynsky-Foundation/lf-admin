import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import FileCard from './FileCard';

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
      name: 'concert-photo.jpg',
      dateAdded: '15.01.2025',
      imageSrc: '/images/image.png',
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
      name: 'starred-photo.png',
      dateAdded: '01.01.2025',
      imageSrc: '/images/image.png',
      isStarred: true,
      usageLinks: 5,
    },
    onClick: fn(),
  },
};
