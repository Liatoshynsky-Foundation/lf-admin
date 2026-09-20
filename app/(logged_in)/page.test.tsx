import { redirect } from 'next/navigation';

import Page from './page';

jest.mock('next/navigation', () => ({
  redirect: jest.fn()
}));

describe('Page', () => {
  it('should redirect to the main page', () => {
    Page();

    expect(redirect).toHaveBeenCalledWith('/main-page');
  });
});