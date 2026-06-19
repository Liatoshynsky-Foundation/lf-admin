import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { graphql, HttpResponse } from 'msw';

import { getRouter } from '../../.storybook/mocks/next-navigation';
import { withMswHandlers } from '../../.storybook/msw';
import ResetPasswordPage from './page';

const verifyTokenHandler = graphql.query('VerifyResetToken', () =>
  HttpResponse.json({ data: { verifyResetToken: true } })
);

const meta = {
  title: 'Pages/ResetPasswordPage',
  component: ResetPasswordPage,
  args: {
    searchParams: Promise.resolve({ token: 'valid-token-123' })
  },
  parameters: {
    layout: 'fullscreen',
    nextNavigation: { pathname: '/reset-password' },
    ...withMswHandlers(verifyTokenHandler)
  }
} satisfies Meta<typeof ResetPasswordPage>;

export default meta;
type Story = StoryObj<typeof meta>;

async function fillResetForm(canvasElement: HTMLElement, pass1: string, pass2: string) {
  const canvas = within(canvasElement);
  await userEvent.type(await canvas.findByLabelText(/^Новий пароль/i), pass1);
  await userEvent.type(await canvas.findByLabelText(/Повторіть пароль/i), pass2); // було: /Підтвердження паролю/i
  await userEvent.click(await canvas.findByRole('button', { name: /Змінити пароль/i }));
  return canvas;
}

export const Default: Story = {};

export const SuccessfulReset: Story = {
  parameters: {
    ...withMswHandlers(
      verifyTokenHandler,
      graphql.mutation('ResetPassword', () =>
        HttpResponse.json({
          data: {
            resetPassword: {
              __typename: 'SuccessPayload',
              success: true,
              message: 'Пароль успішно змінено. Увійдіть з новим паролем.'
            }
          }
        })
      )
    )
  },
  async play({ canvasElement }) {
    await fillResetForm(canvasElement, 'Pass123456!', 'Pass123456!');
    await expect(getRouter().push).toHaveBeenCalledWith('/login');
  }
};

export const PasswordMismatch: Story = {
  parameters: {
    ...withMswHandlers(verifyTokenHandler)
  },
  async play({ canvasElement }) {
    await fillResetForm(canvasElement, 'Pass123456!', 'WrongPass!');
    await expect(await within(canvasElement).findByText(/Паролі не збігаються/i)).toBeInTheDocument();
  }
};
