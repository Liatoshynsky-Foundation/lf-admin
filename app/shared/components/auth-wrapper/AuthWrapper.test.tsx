import { render, screen } from '@testing-library/react';

import AuthWrapper from './AuthWrapper';
import { ACCESS_TOKEN_COOKIE_NAME } from '~/back-constants/index';

const mockGet = jest.fn();
const mockRedirect = jest.fn();

jest.mock('next/headers', () => ({
  cookies: jest.fn(() =>
    Promise.resolve({
      get: mockGet
    })
  )
}));

jest.mock('next/navigation', () => ({
  redirect: (args: any) => mockRedirect(args)
}));

const renderWrapper = async () => {
  render(await AuthWrapper({ children: <div>Test Content</div> }));
};

describe('AuthWrapper', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should redirect to "/login" if token is undefined', async () => {
    mockGet.mockReturnValue(undefined);

    await renderWrapper();

    expect(mockGet).toHaveBeenCalledWith(ACCESS_TOKEN_COOKIE_NAME);
    expect(mockRedirect).toHaveBeenCalledWith('/login');
    expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
  });

  it('should render children if token is defined', async () => {
    mockGet.mockReturnValue('mocked_token');

    await renderWrapper();

    expect(mockGet).toHaveBeenCalledWith(ACCESS_TOKEN_COOKIE_NAME);
    expect(mockRedirect).not.toHaveBeenCalled();
    expect(screen.queryByText('Test Content')).toBeInTheDocument();
  });
});
