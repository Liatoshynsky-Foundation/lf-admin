import { cookies } from 'next/headers';
import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from 'src/constants';

import { logoutAction } from './auth';

jest.mock('next/headers', () => ({
  cookies: jest.fn()
}));

describe('logoutAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete access and refresh cookies', async () => {
    const mockDelete = jest.fn();

    (cookies as jest.Mock).mockResolvedValue({
      delete: mockDelete
    });

    await logoutAction();

    expect(cookies).toHaveBeenCalled();
    expect(mockDelete).toHaveBeenCalledWith(ACCESS_TOKEN_COOKIE_NAME);
    expect(mockDelete).toHaveBeenCalledWith(REFRESH_TOKEN_COOKIE_NAME);
    expect(mockDelete).toHaveBeenCalledTimes(2);
  });
});
