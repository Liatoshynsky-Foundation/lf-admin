import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { CustomTabs } from './Tabs';

const sampleTabs = [
  { id: 'all', label: 'Всі' },
  { id: 'images', label: 'Зображення' },
  { id: 'audio', label: 'Аудіо' },
  { id: 'documents', label: 'Документи' },
];

const meta = {
  title: 'Design System/Tabs',
  component: CustomTabs,
  tags: ['autodocs'],
  argTypes: {
    tabs: {
      control: false,
    },
    onTabChange: {
      control: false,
    },
    className: {
      control: 'text',
    },
    dataTestId: {
      control: 'text',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Controlled tabs component for switching between related views while preserving the project visual style.'
      }
    }
  },
  decorators: [
    (Story) => (
      <div style={{ width: '600px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CustomTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    tabs: sampleTabs,
    activeTab: 'all',
    onTabChange: fn(),
  },
};

export const SecondTabActive: Story = {
  args: {
    tabs: sampleTabs,
    activeTab: 'images',
    onTabChange: fn(),
  },
};

export const TwoTabs: Story = {
  args: {
    tabs: [
      { id: 'uk', label: 'Українська' },
      { id: 'en', label: 'English' },
    ],
    activeTab: 'uk',
    onTabChange: fn(),
  },
};
