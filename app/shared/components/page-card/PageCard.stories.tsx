import { Meta, StoryObj } from '@storybook/react';

import PageCard from './PageCard';

const meta = {
  title: 'Shared/PageCard',
  component: PageCard,
  tags: ['autodocs'],
  argTypes: {
    coverImage: {
      control: false
    },
    title: {
      control: false
    },
    updatedAt: {
      control: 'text'
    },
    editHref: {
      control: 'text'
    },
    onClick: {
      control: false
    }
  },
  parameters: {
    docs: {
      description: {
        component: 'Reusable page card for admin pages lists items with status, dates, and quick actions.'
      }
    }
  },
  decorators: [
    (Story) => (
      <div style={{ width: '320px' }}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof PageCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultPageCard: Story = {
  args: {
    coverImage: {
      src: '/images/image.png',
      alt: { uk: 'Зображення', en: 'Image' }
    },
    title: { uk: 'Про Фундацію', en: 'About the Foundation' },
    updatedAt: '2025-01-16',
    editHref: '#'
  }
};
