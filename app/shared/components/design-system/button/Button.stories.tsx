import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Plus, Trash2 } from 'lucide-react';

import Button from './Button';

const meta = {
  title: 'Design System/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Reusable primary action button with the project variants, colors, icon slots, and loading state.'
      }
    }
  },
  argTypes: {
    label: {
      control: 'text',
    },
    variant: {
      control: 'select',
      options: ['filled', 'outlined', 'text'],
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    disabled: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
    startIcon: {
      control: false,
    },
    endIcon: {
      control: false,
    },
    component: {
      control: false,
    },
    children: {
      control: false,
    },
    sx: {
      control: false,
    },
    LinkComponent: {
      control: false,
    },
  },
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Button',
    variant: 'filled',
    color: 'primary',
    size: 'medium',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    variant: 'filled',
    color: 'primary',
    disabled: true,
  },
};

export const PrimaryFilled: Story = {
  args: {
    label: 'Primary Filled',
    variant: 'filled',
    color: 'primary',
  },
};

export const PrimaryOutlined: Story = {
  args: {
    label: 'Primary Outlined',
    variant: 'outlined',
    color: 'primary',
  },
};

export const PrimaryText: Story = {
  args: {
    label: 'Primary Text',
    variant: 'text',
    color: 'primary',
  },
};

export const SecondaryFilled: Story = {
  args: {
    label: 'Secondary Filled',
    variant: 'filled',
    color: 'secondary',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div style={{ backgroundColor: '#190D03', padding: '24px' }}>
        <Story />
      </div>
    ),
  ],
};

export const TertiaryFilled: Story = {
  args: {
    label: 'Tertiary Filled',
    variant: 'filled',
    color: 'tertiary',
  },
};

export const WithStartIcon: Story = {
  args: {
    label: 'Add item',
    variant: 'filled',
    color: 'primary',
    startIcon: <Plus />,
  },
};

export const WithEndIcon: Story = {
  args: {
    label: 'Delete',
    variant: 'outlined',
    color: 'primary',
    endIcon: <Trash2 />,
  },
};

export const Loading: Story = {
  args: {
    label: 'Loading...',
    variant: 'filled',
    color: 'primary',
    loading: true,
  },
};

export const Small: Story = {
  args: {
    label: 'Small',
    size: 'small',
    variant: 'filled',
    color: 'primary',
  },
};

export const Large: Story = {
  args: {
    label: 'Large',
    size: 'large',
    variant: 'filled',
    color: 'primary',
  },
};
