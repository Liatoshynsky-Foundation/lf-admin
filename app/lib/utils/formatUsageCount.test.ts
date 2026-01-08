import { formatUsageCount } from './formatUsageCount';

describe('formatUsageCount', () => {
  test('should use "звʼязка" for numbers ending with 1 (except 11)', () => {
    expect(formatUsageCount(1)).toBe('1 звʼязка');
    expect(formatUsageCount(21)).toBe('21 звʼязка');
    expect(formatUsageCount(101)).toBe('101 звʼязка');
  });

  test('should use "звʼязки" for numbers ending with 2–4 (except 12–14)', () => {
    expect(formatUsageCount(2)).toBe('2 звʼязки');
    expect(formatUsageCount(3)).toBe('3 звʼязки');
    expect(formatUsageCount(4)).toBe('4 звʼязки');

    expect(formatUsageCount(22)).toBe('22 звʼязки');
    expect(formatUsageCount(23)).toBe('23 звʼязки');
    expect(formatUsageCount(24)).toBe('24 звʼязки');
  });

  test('should use "звʼязок" for numbers ending with 0 or 5–9', () => {
    expect(formatUsageCount(0)).toBe('0 звʼязок');
    expect(formatUsageCount(5)).toBe('5 звʼязок');
    expect(formatUsageCount(9)).toBe('9 звʼязок');

    expect(formatUsageCount(10)).toBe('10 звʼязок');
    expect(formatUsageCount(15)).toBe('15 звʼязок');
    expect(formatUsageCount(19)).toBe('19 звʼязок');
  });

  test('should use "звʼязок" for 11–14 (special case)', () => {
    expect(formatUsageCount(11)).toBe('11 звʼязок');
    expect(formatUsageCount(12)).toBe('12 звʼязок');
    expect(formatUsageCount(13)).toBe('13 звʼязок');
    expect(formatUsageCount(14)).toBe('14 звʼязок');

    expect(formatUsageCount(111)).toBe('111 звʼязок');
    expect(formatUsageCount(112)).toBe('112 звʼязок');
    expect(formatUsageCount(113)).toBe('113 звʼязок');
    expect(formatUsageCount(114)).toBe('114 звʼязок');
  });

  test('defensive: negative values should be clamped to 0', () => {
    expect(formatUsageCount(-1)).toBe('0 звʼязок');
    expect(formatUsageCount(-12)).toBe('0 звʼязок');
    expect(formatUsageCount(-999)).toBe('0 звʼязок');
  });

  test('defensive: floats should be truncated toward zero before formatting', () => {
    expect(formatUsageCount(1.9)).toBe('1 звʼязка');
    expect(formatUsageCount(2.1)).toBe('2 звʼязки');
    expect(formatUsageCount(4.99)).toBe('4 звʼязки');
    expect(formatUsageCount(11.99)).toBe('11 звʼязок');
    expect(formatUsageCount(14.0001)).toBe('14 звʼязок');
    expect(formatUsageCount(20.9)).toBe('20 звʼязок');
  });
});
