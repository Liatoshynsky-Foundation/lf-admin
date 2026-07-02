import { render, screen } from '@testing-library/react';
import { notFound, useParams } from 'next/navigation';
import React from 'react';

import CreatePublicationPage from './page';
import { PUBLICATIONS_TYPES } from '~/constants/publications';
import { useUpsertPublication } from '~/shared/hooks/use-upsert-publication/useUpsertPublication';

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  notFound: jest.fn()
}));

jest.mock('~/shared/hooks/use-upsert-publication/useUpsertPublication', () => ({
  useUpsertPublication: jest.fn()
}));

jest.mock('./CreatePublicationsView', () => ({
  __esModule: true,
  default: ({ data }: { data: unknown }) => (
    <div data-testid="create-publications-view">{data ? 'With Data' : 'No Data'}</div>
  )
}));

const mockedUseParams = jest.mocked(useParams);
const mockedNotFound = jest.mocked(notFound);
const mockedUseUpsertPublication = jest.mocked(useUpsertPublication);

describe('CreatePublicationPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders successfully when publication type is valid', () => {
    const validProps = PUBLICATIONS_TYPES[0] || 'books';
    mockedUseParams.mockReturnValue({ type: validProps });
    mockedUseUpsertPublication.mockReturnValue({ id: '123' } as unknown as ReturnType<typeof useUpsertPublication>);

    render(<CreatePublicationPage />);

    expect(screen.getByTestId('create-publications-view')).toBeInTheDocument();
    expect(screen.getByText('With Data')).toBeInTheDocument();
    expect(mockedNotFound).not.toHaveBeenCalled();
    expect(mockedUseUpsertPublication).toHaveBeenCalledWith({ type: validProps });
  });

  it('calls notFound when publication type is invalid', () => {
    mockedUseParams.mockReturnValue({ type: 'invalid-type' });

    render(<CreatePublicationPage />);

    expect(mockedNotFound).toHaveBeenCalledTimes(1);
  });

  it('calls notFound when params are missing or undefined', () => {
    mockedUseParams.mockReturnValue({});

    render(<CreatePublicationPage />);

    expect(mockedNotFound).toHaveBeenCalledTimes(1);
  });
});
