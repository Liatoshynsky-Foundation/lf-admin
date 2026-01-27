import { render, screen } from '@testing-library/react';

import { NewsDetails } from './NewsDetails';
import { NewsStatus } from '~/types/enums/common.enums';

describe('NewsDetails', () => {
  it('renders news title correctly', () => {
    render(<NewsDetails title="Test News" status={NewsStatus.Published} publicationDate="2025-01-15T10:30:00Z" />);

    expect(screen.getByText('Test News')).toBeInTheDocument();
  });

  it('displays published status with correct styling', () => {
    render(<NewsDetails title="Test News" status={NewsStatus.Published} />);

    expect(screen.getByText('Опубліковано')).toBeInTheDocument();
  });

  it('displays draft status', () => {
    render(<NewsDetails title="Test News" status={NewsStatus.Draft} />);

    expect(screen.getByText('Чернетка')).toBeInTheDocument();
  });

  it('displays hidden status', () => {
    render(<NewsDetails title="Test News" status={NewsStatus.Hidden} />);

    expect(screen.getByText('Приховано')).toBeInTheDocument();
  });

  it('displays archived status', () => {
    render(<NewsDetails title="Test News" status={NewsStatus.Archived} />);

    expect(screen.getByText('Архівовано')).toBeInTheDocument();
  });

  it('displays editing status', () => {
    render(<NewsDetails title="Test News" status={NewsStatus.Editing} />);

    expect(screen.getByText('Редагується')).toBeInTheDocument();
  });

  it('formats publication date correctly', () => {
    render(<NewsDetails title="Test News" status={NewsStatus.Published} publicationDate="2025-01-15T10:30:00Z" />);

    expect(screen.getByText(/15/)).toBeInTheDocument();
  });

  it('displays "Не вказано" when no publication date is provided', () => {
    render(<NewsDetails title="Test News" status={NewsStatus.Draft} />);

    expect(screen.getByText('Не вказано')).toBeInTheDocument();
  });
});
