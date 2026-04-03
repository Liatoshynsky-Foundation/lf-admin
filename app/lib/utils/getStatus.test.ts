import { formatDate } from './formatDate';
import { getStatus } from './getStatus';

jest.mock('./formatDate', () => ({
  formatDate: jest.fn()
}));

describe('getStatus', () => {
  const mockedFormatDate = formatDate as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return edited date when status is published and updatedAt exists', () => {
    mockedFormatDate.mockReturnValue('formatted-date');

    const result = getStatus('published', '2024-01-01', '2024-02-01');

    expect(result).toBe('Редаговано formatted-date');
    expect(mockedFormatDate).toHaveBeenCalledWith('2024-02-01');
  });

  it('should return published date when status is published and no updatedAt but publishedAt exists', () => {
    mockedFormatDate.mockReturnValue('formatted-date');

    const result = getStatus('published', '2024-01-01', undefined, '2024-03-01');

    expect(result).toBe('Опубліковано formatted-date');
    expect(mockedFormatDate).toHaveBeenCalledWith('2024-03-01');
  });

  it('should return default published text when no dates provided', () => {
    const result = getStatus('published', '2024-01-01');

    expect(result).toBe('Опубліковано');
  });

  it('should return created date when status is draft', () => {
    mockedFormatDate.mockReturnValue('formatted-date');

    const result = getStatus('draft', '2024-01-01');

    expect(result).toBe('Створено formatted-date');
    expect(mockedFormatDate).toHaveBeenCalledWith('2024-01-01');
  });

  it('should return draft label when createdAt is missing', () => {
    const result = getStatus('draft');

    expect(result).toBe('Чернетка');
  });

  it('should treat published_with_draft as published content', () => {
    mockedFormatDate.mockReturnValue('formatted-date');

    const result = getStatus('published_with_draft', '2024-01-01', '2024-02-01');

    expect(result).toBe('Редаговано formatted-date');
    expect(mockedFormatDate).toHaveBeenCalledWith('2024-02-01');
  });

  it('should return empty string for unknown status', () => {
    const result = getStatus('archived', '2024-01-01');

    expect(result).toBe('');
  });

  it('should prioritize updatedAt over publishedAt when both exist', () => {
    mockedFormatDate.mockReturnValue('formatted-date');

    const result = getStatus('published', '2024-01-01', '2024-02-01', '2024-03-01');

    expect(result).toBe('Редаговано formatted-date');
    expect(mockedFormatDate).toHaveBeenCalledWith('2024-02-01');
  });
});
