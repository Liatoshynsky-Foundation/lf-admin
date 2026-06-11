import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { graphql, HttpResponse } from 'msw';

import { getRouter } from '../../.storybook/mocks/next-navigation';
import { withMswHandlers } from '../../.storybook/msw';
import ResetPasswordPage from './page';

const meta = {
  title: 'Pages/ResetPasswordPage',
  component: ResetPasswordPage,
  args: {
    searchParams: Promise.resolve({ token: 'valid-token-123' })
  },
  parameters: {
    layout: 'fullscreen',
    nextNavigation: {
      pathname: '/reset-password'
    }
  }
  // ... решта коду
} satisfies Meta<typeof ResetPasswordPage>;

export default meta;
type Story = StoryObj<typeof meta>;

async function fillResetForm(canvasElement: HTMLElement, pass1: string, pass2: string) {
  const canvas = within(canvasElement);
  await userEvent.type(await canvas.findByLabelText(/^Новий пароль/i), pass1);
  await userEvent.type(await canvas.findByLabelText(/Підтвердження паролю/i), pass2);
  await userEvent.click(await canvas.findByRole('button', { name: /Змінити пароль/i }));
  return canvas;
}

export const Default: Story = {};

export const SuccessfulReset: Story = {
  parameters: {
    ...withMswHandlers(
      graphql.mutation('ResetPassword', () =>
        HttpResponse.json({
          data: { resetPassword: { success: true } }
        })
      )
    )
  },
  async play({ canvasElement }) {
    await fillResetForm(canvasElement, 'Pass123456!', 'Pass123456!');
    // Очікуємо редірект на логін
    await expect(getRouter().push).toHaveBeenCalledWith('/login');
  }
};

export const PasswordMismatch: Story = {
  async play({ canvasElement }) {
    await fillResetForm(canvasElement, 'Pass123456!', 'WrongPass!');
    await expect(await within(canvasElement).findByText(/Паролі не збігаються/i)).toBeInTheDocument();
  }
};
