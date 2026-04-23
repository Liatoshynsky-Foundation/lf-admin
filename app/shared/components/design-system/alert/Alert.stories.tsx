import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import Alert from './Alert';

const meta = {
  title: 'Design System/Alert',
  component: Alert,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Closable status alert for inline feedback with severity, variant, title, description, and optional action label.'
      }
    }
  },
  argTypes: {
    severity: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error'],
    },
    variant: {
      control: 'select',
      options: ['filled', 'outlined'],
    },
    title: {
      control: 'text',
    },
    description: {
      control: 'text',
    },
    label: {
      control: 'text',
    },
    icon: {
      control: false,
    },
    action: {
      control: false,
    },
    children: {
      control: false,
    },
    classes: {
      control: false,
    },
    closeText: {
      control: false,
    },
    components: {
      control: false,
    },
    componentsProps: {
      control: false,
    },
    iconMapping: {
      control: false,
    },
    onClose: {
      control: false,
    },
    role: {
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
  },
  args: {
    onClose: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ minWidth: '420px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Alert>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    severity: 'info',
    variant: 'filled',
    title: 'Інформаційне повідомлення',
    description: 'Коротке пояснення для користувача всередині поточного контексту.',
  },
};

export const Outlined: Story = {
  args: {
    severity: 'warning',
    variant: 'outlined',
    title: 'Увага',
    description: 'Перевірте зміни перед збереженням.',
  },
};

export const Success: Story = {
  args: {
    severity: 'success',
    variant: 'filled',
    title: 'Збережено',
    description: 'Дані оновлено успішно.',
    label: 'Закрити',
  },
};

export const ErrorAlert: Story = {
  args: {
    severity: 'error',
    variant: 'outlined',
    title: 'Помилка завантаження',
    description: 'Спробуйте ще раз або перевірте з’єднання.',
    label: 'Dismiss',
  },
};