import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { graphql, HttpResponse } from 'msw';

import { withMswHandlers } from '../../.storybook/msw';
import ForgotPasswordPage from './page';

const meta = {
  title: 'Pages/ForgotPasswordPage',
  component: ForgotPasswordPage,
  parameters: {
    layout: 'fullscreen',
    nextNavigation: { pathname: '/forgot-password' }
  }
} satisfies Meta<typeof ForgotPasswordPage>;

export default meta;
type Story = StoryObj<typeof meta>;

async function submitEmail(canvasElement: HTMLElement, email: string) {
  const canvas = within(canvasElement);
  await userEvent.type(await canvas.findByLabelText(/Електронна адреса/i), email);
  await userEvent.click(await canvas.findByRole('button', { name: /Відновити пароль/i }));
  return canvas;
}

export const Default: Story = {};

export const SuccessfulRequest: Story = {
  parameters: {
    ...withMswHandlers(
      graphql.mutation('RequestPasswordReset', () =>
        HttpResponse.json({
          data: { requestPasswordReset: { success: true } }
        })
      )
    )
  },
  async play({ canvasElement }) {
    await submitEmail(canvasElement, 'admin@example.com');

    const expectedMessage =
      'Якщо обліковий запис із цією електронною адресою існує, ми надіслали інструкції для відновлення пароля.';
    await expect(await within(canvasElement).findByText(expectedMessage)).toBeInTheDocument();
  }
};

export const ServerError: Story = {
  parameters: {
    ...withMswHandlers(graphql.mutation('RequestPasswordReset', () => new HttpResponse(null, { status: 500 })))
  },
  async play({ canvasElement }) {
    await submitEmail(canvasElement, 'admin@example.com');
    await expect(await within(canvasElement).findByText(/Сталася помилка/i)).toBeInTheDocument();
  }
};
