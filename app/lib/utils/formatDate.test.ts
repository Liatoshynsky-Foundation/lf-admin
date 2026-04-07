import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('should format ISO date string to uk-UA locale', () => {
    const date = '2023-10-05T00:00:00.000Z';

    const result = formatDate(date);

    expect(result).toBe('05.10.2023');
  });
});
