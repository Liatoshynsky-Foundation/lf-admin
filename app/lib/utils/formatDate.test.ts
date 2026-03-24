import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('should format ISO date string to uk-UA locale', () => {
    const date = '2023-10-05T00:00:00.000Z';

    const result = formatDate(date);

    expect(result).toBe('05.10.2023');
  });

  it('should format simple date string', () => {
    const date = '2023-01-01';

    const result = formatDate(date);

    expect(result).toBe('01.01.2023');
  });

  it('should handle different date values', () => {
    const date = '2024-12-25';

    const result = formatDate(date);

    expect(result).toBe('25.12.2024');
  });

  it('should return "Invalid Date" for incorrect input', () => {
    const date = 'invalid-date';

    const result = formatDate(date);

    expect(result).toBe('Invalid Date');
  });
});
