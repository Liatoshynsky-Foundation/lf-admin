import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('should format ISO date string to uk-UA locale', () => {
    const date = '2023-10-05T00:00:00.000Z';

    const result = formatDate(date);

    expect(result).toBe('05.10.2023');
  });

  it('should format numeric timestamp string to uk-UA locale', () => {
    const timestamp = '1696464000000';

    const result = formatDate(timestamp);

    expect(result).toBe('05.10.2023');
  });
});
