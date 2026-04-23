import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { graphql, HttpResponse } from 'msw';

import { getRouter } from '../../.storybook/mocks/next-navigation';
import { withMswHandlers } from '../../.storybook/msw';
import LoginPage from './page';

const meta = {
  title: 'Pages/LoginPage',
  component: LoginPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Page-level auth story that exercises the shared Storybook provider stack, centralized App Router mocks, and GraphQL request mocking via MSW.',
      },
    },
    nextNavigation: {
      pathname: '/login',
    },
  },
  async beforeEach() {
    getRouter().push.mockClear();
  },
} satisfies Meta<typeof LoginPage>;

export default meta;

type Story = StoryObj<typeof meta>;

async function submitCredentials(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);

  await userEvent.type(await canvas.findByLabelText(/Логін/i), 'admin@example.com');
  await userEvent.type(await canvas.findByLabelText(/Пароль/i), 'secret-password');
  await userEvent.click(await canvas.findByRole('button', { name: 'Увійти' }));

  return canvas;
}

export const Default: Story = {};

export const SuccessfulLogin: Story = {
  parameters: {
    ...withMswHandlers(
      graphql.mutation('Login', () =>
        HttpResponse.json({
          data: {
            login: {
              __typename: 'LoginPayload',
              success: true,
              adminId: 'admin-1',
              adminType: 'superadmin',
            },
          },
        })
      )
    ),
  },
  async play({ canvasElement }) {
    await submitCredentials(canvasElement);

    await expect(getRouter().push).toHaveBeenCalledWith('/');
  },
};

export const InvalidCredentials: Story = {
  parameters: {
    ...withMswHandlers(
      graphql.mutation('Login', () =>
        HttpResponse.json({
          data: {
            login: {
              __typename: 'ErrorPayload',
              success: false,
              message: 'Invalid credentials',
              statusCode: 401,
            },
          },
        })
      )
    ),
  },
  async play({ canvasElement }) {
    const canvas = await submitCredentials(canvasElement);

    await expect(await canvas.findByText('Invalid credentials')).toBeInTheDocument();
  },
};

export const UnexpectedError: Story = {
  parameters: {
    ...withMswHandlers(
      graphql.mutation('Login', () => new HttpResponse(null, { status: 500 }))
    ),
  },
  async play({ canvasElement }) {
    const canvas = await submitCredentials(canvasElement);

    await expect(await canvas.findByText('Непередбачена помилка. Спробуйте ще раз.')).toBeInTheDocument();
  },
};