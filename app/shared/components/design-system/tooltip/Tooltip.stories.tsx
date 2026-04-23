import { Button } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';

import TooltipCustom from './Tooltip';

const meta = {
  title: 'Design System/Tooltip',
  component: TooltipCustom,
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
    },
    text: {
      control: 'text',
    },
    showArrow: {
      control: 'boolean',
    },
    isOpen: {
      control: 'boolean',
    },
    placement: {
      control: 'select',
      options: ['top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end', 'left', 'left-start', 'left-end', 'right', 'right-start', 'right-end'],
    },
    children: {
      control: false,
    },
    wrapperProps: {
      control: false,
    },
    textProps: {
      control: false,
    },
    componentsProps: {
      control: false,
    },
    slotProps: {
      control: false,
    },
    slots: {
      control: false,
    },
    PopperProps: {
      control: false,
    },
    TransitionComponent: {
      control: false,
    },
    TransitionProps: {
      control: false,
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Tooltip wrapper for short helper text with configurable placement, arrow, and controlled visibility.'
      }
    }
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '60px', display: 'flex', justifyContent: 'center' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TooltipCustom>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Tooltip text',
    children: <Button variant="outlined">Hover me</Button>,
  },
};

export const WithArrow: Story = {
  args: {
    title: 'With arrow',
    showArrow: true,
    children: <Button variant="outlined">With Arrow</Button>,
  },
};

export const BottomPlacement: Story = {
  args: {
    title: 'Bottom tooltip',
    placement: 'bottom',
    children: <Button variant="outlined">Bottom</Button>,
  },
};

export const AlwaysOpen: Story = {
  args: {
    title: 'Always visible tooltip',
    isOpen: true,
    showArrow: true,
    children: <Button variant="contained">Always Open</Button>,
  },
};
