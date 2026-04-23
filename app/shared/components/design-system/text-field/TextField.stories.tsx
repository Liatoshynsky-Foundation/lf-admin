import type { Meta, StoryObj } from '@storybook/react';

import { CustomTextField } from './TextField';

const meta = {
  title: 'Design System/TextField',
  component: CustomTextField,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Base text input for forms with support for labels, helper text, validation states, and multiline content.'
      }
    }
  },
  argTypes: {
    title: {
      control: 'text',
    },
    label: {
      control: 'text',
    },
    placeholder: {
      control: 'text',
    },
    helperText: {
      control: 'text',
    },
    defaultValue: {
      control: 'text',
    },
    variant: {
      control: 'select',
      options: ['outlined', 'filled', 'standard'],
    },
    disabled: {
      control: 'boolean',
    },
    error: {
      control: 'boolean',
    },
    fullWidth: {
      control: 'boolean',
    },
    children: {
      control: false,
    },
    component: {
      control: false,
    },
    sx: {
      control: false,
    },
    InputProps: {
      control: false,
    },
    inputProps: {
      control: false,
    },
    InputLabelProps: {
      control: false,
    },
    FormHelperTextProps: {
      control: false,
    },
    SelectProps: {
      control: false,
    },
    slotProps: {
      control: false,
    },
    slots: {
      control: false,
    },
  },
} satisfies Meta<typeof CustomTextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Label',
    placeholder: 'Enter text...',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled field',
    disabled: true,
    placeholder: 'Cannot enter text',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    error: true,
    helperText: 'Invalid email address',
    defaultValue: 'invalid-email',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Name',
    defaultValue: 'Борис Лятошинський',
  },
};

export const WithTitle: Story = {
  args: {
    title: 'Заголовок',
    label: 'Label',
    placeholder: 'Placeholder text',
  },
};

export const FullWidth: Story = {
  args: {
    label: 'Full width field',
    fullWidth: true,
    placeholder: 'Full width...',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
};
