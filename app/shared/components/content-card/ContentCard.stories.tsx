import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import ContentCard from './ContentCard';

const meta = {
  title: 'Shared/ContentCard',
  component: ContentCard,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'radio',
      options: ['news', 'event', 'media'],
    },
    coverImage: {
      control: false,
    },
    title: {
      control: false,
    },
    status: {
      control: 'text',
    },
    updatedAt: {
      control: 'text',
    },
    createdAt: {
      control: 'text',
    },
    publishedAt: {
      control: 'text',
    },
    editHref: {
      control: 'text',
    },
    onClick: {
      control: false,
    },
    onClickMenu: {
      control: false,
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Reusable content card for admin lists of news, events, and media items with status, dates, and quick actions.'
      }
    }
  },
  decorators: [
    (Story) => (
      <div style={{ width: '320px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ContentCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NewsCard: Story = {
  args: {
    type: 'news',
    coverImage: {
      src: { uk: '/images/image.png', en: '/images/image.png' },
      alt: { uk: 'Новина', en: 'News' },
    },
    title: { uk: 'Заголовок новини', en: 'News Title' },
    status: 'published',
    createdAt: '2025-01-15T12:00:00Z',
    updatedAt: '2025-01-16T12:00:00Z',
    editHref: '#',
    onClickMenu: fn(),
  },
};

export const EventCard: Story = {
  args: {
    type: 'event',
    coverImage: {
      src: { uk: '/images/image.png', en: '/images/image.png' },
      alt: { uk: 'Подія', en: 'Event' },
    },
    title: { uk: 'Концерт до дня народження Лятошинського' },
    status: 'published',
    createdAt: '2025-03-10T12:00:00Z',
    publishedAt: '2025-03-12T12:00:00Z',
    editHref: '#',
    onClickMenu: fn(),
  },
};

export const MediaCard: Story = {
  args: {
    type: 'media',
    coverImage: {
      src: { uk: '/images/image.png', en: '/images/image.png' },
      alt: { uk: 'ЗМІ', en: 'Media' },
    },
    title: { uk: 'Публікація у ЗМІ' },
    status: 'published',
    updatedAt: '2025-02-20T12:00:00Z',
    editHref: '#',
    onClickMenu: fn(),
  },
};

export const DraftCard: Story = {
  args: {
    type: 'news',
    coverImage: {
      src: { uk: '', en: '' },
      alt: { uk: '', en: '' },
    },
    title: { uk: 'Чернетка без зображення' },
    status: 'draft',
    createdAt: '2025-04-01T12:00:00Z',
    editHref: '#',
    onClickMenu: fn(),
  },
};

export const WithClickHandler: Story = {
  args: {
    type: 'news',
    coverImage: {
      src: { uk: '/images/image.png', en: '/images/image.png' },
      alt: { uk: 'Новина', en: 'News' },
    },
    title: { uk: 'Картка з onClick замість href' },
    status: 'published',
    createdAt: '2025-01-15T12:00:00Z',
    onClick: fn(),
    onClickMenu: fn(),
  },
};
