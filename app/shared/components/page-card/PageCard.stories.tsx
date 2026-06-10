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
    editSeoHref: {
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

export const Default: Story = {
  args: {
    coverImage: {
      src: '/images/temp_page-card-static.png',
      alt: { uk: 'Зображення', en: 'Image' }
    },
    title: { uk: 'Про Фундацію', en: 'About the Foundation' },
    updatedAt: '2025-01-16',
    editHref: '#',
    editSeoHref: '#'
  }
};

export const LongTitle: Story = {
  args: {
    ...Default.args,
    title: {
      uk: 'Дуже довгий заголовок сторінки, який спеціально створений для того, щоб зайняти три або більше рядків екрана і перевірити, чи правильно працює обмеження тексту',
      en: 'Very long page title that is purposefully written to span across three or more lines of text to verify if line clamping works as expected'
    }
  }
};

export const MissingDate: Story = {
  args: {
    ...Default.args,
    updatedAt: undefined
  }
};

export const ImageLoadError: Story = {
  args: {
    ...Default.args,
    coverImage: {
      src: '/broken-image-link-404.png',
      alt: { uk: 'Зображення з помилкою', en: 'Broken image' }
    }
  }
};
