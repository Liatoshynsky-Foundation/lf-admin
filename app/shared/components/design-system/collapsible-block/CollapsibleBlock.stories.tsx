import type { Meta, StoryObj } from '@storybook/react';

import CollapsibleBlock from './CollapsibleBlock';

const sampleContent = (
  <div style={{ display: 'grid', gap: '8px' }}>
    <p style={{ margin: 0 }}>Контент блоку для швидкої перевірки розгортання та вкладеного вмісту.</p>
    <p style={{ margin: 0 }}>Підійде для форм, налаштувань або допоміжних секцій.</p>
  </div>
);

const meta = {
  title: 'Design System/CollapsibleBlock',
  component: CollapsibleBlock,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Accordion-like container for collapsing secondary content blocks while preserving the project visual style.'
      }
    }
  },
  argTypes: {
    title: {
      control: 'text',
    },
    defaultExpanded: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    disableGutters: {
      control: 'boolean',
    },
    children: {
      control: false,
    },
    childrenContainerSx: {
      control: false,
    },
    classes: {
      control: false,
    },
    component: {
      control: false,
    },
    onChange: {
      control: false,
    },
    slotProps: {
      control: false,
    },
    slots: {
      control: false,
    },
    sx: {
      control: false,
    },
    TransitionComponent: {
      control: false,
    },
    TransitionProps: {
      control: false,
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '520px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CollapsibleBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Додаткові налаштування',
    children: sampleContent,
  },
};

export const Expanded: Story = {
  args: {
    title: 'Розгорнутий блок',
    defaultExpanded: true,
    children: sampleContent,
  },
};

export const Disabled: Story = {
  args: {
    title: 'Недоступний блок',
    disabled: true,
    children: sampleContent,
  },
};