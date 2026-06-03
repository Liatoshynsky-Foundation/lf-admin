import type { Meta, StoryObj } from '@storybook/react';

import Badge from './Badge';

const meta = {
  title: 'Shared/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'radio',
      options: ['news', 'events', 'media', 'draft', 'published']
    },
    localizations: {
      control: 'radio',
      options: ['uk', 'en'],
    }
  },
  args: {
    localizations: ['uk', 'en']
  },
  parameters: {
    docs: {
      description: {
        component: 'Reusable badge for admin card on news & events page.'
      }
    }
  },
  decorators: [
    (Story) => (
      <Story />
    )
  ]
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DraftBadge: Story = {
  args: {
    variant: 'draft',
    label: 'Чернетка',
  }
};
export const DraftBadgeLocalised: Story = {
  args: {
    variant: 'draft',
    label: 'Чернетка',
    localizations: ['uk']
  }
};

export const PublishedBadge: Story = {
  args: {
    variant: 'published',
  }
};
export const PublishedBadgeLocalised: Story = {
  args: {
    variant: 'published',
    localizations: ['uk']
  }
};


export const NewsBadge: Story = {
  args: {
    variant: 'news',
  }
};

export const NewsBadgeLocalised: Story = {
  args: {
    variant: 'news',
    localizations: ['uk']
  }
};

export const EventBadge: Story = {
  args: {
    variant: 'events',
  }
};
export const EventBadgeLocalised: Story = {
  args: {
    variant: 'events',
    localizations: ['uk']
  }
};

export const MediaBadge: Story = {
  args: {
    variant: 'media',
  }
};

export const MediaBadgeLocalised: Story = {
  args: {
    variant: 'media',
    localizations: ['uk']
  }
};




