import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { type FilterOption,FilterSelect } from './FilterSelect';

const sampleOptions: FilterOption[] = [
  { value: 'news', label: 'Новини' },
  { value: 'events', label: 'Події' },
  { value: 'media', label: 'Ми у ЗМІ' },
  { value: 'articles', label: 'Статті' },
];

const meta = {
  title: 'Design System/Select',
  component: FilterSelect,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Filter select with multi-select support, optional single-select mode, selection limits, and clear action.'
      }
    }
  },
  argTypes: {
    label: {
      control: 'text',
    },
    options: {
      control: false,
    },
    value: {
      control: false,
    },
    defaultValue: {
      control: false,
    },
    defaultValues: {
      control: false,
    },
    variant: {
      control: 'select',
      options: ['filled', 'outlined'],
    },
    disabled: {
      control: 'boolean',
    },
    maxSelections: {
      control: 'number',
    },
    hideCounterChip: {
      control: 'boolean',
    },
    hideClearAction: {
      control: 'boolean',
    },
    menuMinWidth: {
      control: 'number',
    },
    clearLabel: {
      control: 'text',
    },
    onChange: {
      control: false,
    },
    onAdd: {
      control: false,
    },
    onRemove: {
      control: false,
    },
  },
  decorators: [
    (Story) => (
      <div style={{ minWidth: '250px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FilterSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Category',
    options: sampleOptions,
    onChange: fn(),
  },
};

export const Disabled: Story = {
  args: {
    label: 'Category',
    options: sampleOptions,
    disabled: true,
  },
};

export const WithDefaultValue: Story = {
  args: {
    label: 'Category',
    options: sampleOptions,
    defaultValue: ['news'],
    onChange: fn(),
  },
};

export const SingleSelect: Story = {
  args: {
    label: 'Type',
    options: sampleOptions,
    maxSelections: 1,
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Single-select mode is enabled with maxSelections=1. The menu closes after choosing one option.'
      }
    }
  },
};

export const OutlinedVariant: Story = {
  args: {
    label: 'Filter',
    options: sampleOptions,
    variant: 'outlined',
    onChange: fn(),
  },
};
