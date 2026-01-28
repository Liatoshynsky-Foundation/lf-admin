import { sxToArray } from './sxToArray';

describe('sxToArray', () => {
  it('should return empty array when sx is not provided', () => {
    expect(sxToArray()).toEqual([]);
  });

  it('should wrap a single sx object into an array', () => {
    const sx = { p: 1 };
    expect(sxToArray(sx)).toEqual([sx]);
  });

  it('should return the same array reference when sx is already an array', () => {
    const sx = [{ p: 1 }, { m: 2 }];
    expect(sxToArray(sx)).toBe(sx);
  });
});
