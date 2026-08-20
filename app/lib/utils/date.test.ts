import { formatPublishDateForSave, formatPublishDateInput, publishDateToDayjs } from './date';

describe('formatPublishDateInput', () => {
  it('formats numeric input as DD/MM/YYYY', () => {
    expect(formatPublishDateInput('12052024')).toBe('12/05/2024');
  });

  it('strips non-numeric characters and limits the input to eight digits', () => {
    expect(formatPublishDateInput('12abc05202499')).toBe('12/05/2024');
  });
});

describe('publishDateToDayjs', () => {
  it.each(['2024-05-12', '12/05/2024'])('parses supported format %s', (value) => {
    expect(publishDateToDayjs(value)?.isValid()).toBe(true);
  });

  it('returns null for an empty or invalid value', () => {
    expect(publishDateToDayjs()).toBeNull();
    expect(publishDateToDayjs('31/02/2024')).toBeNull();
    expect(publishDateToDayjs('2024')).toBeNull();
  });
});

describe('formatPublishDateForSave', () => {
  it('normalizes valid dates to YYYY-MM-DD', () => {
    expect(formatPublishDateForSave('12/05/2024')).toBe('2024-05-12');
  });

  it('omits an empty date and preserves an unparsed value', () => {
    expect(formatPublishDateForSave('   ')).toBeUndefined();
    expect(formatPublishDateForSave('not-a-date')).toBe('not-a-date');
  });
});
