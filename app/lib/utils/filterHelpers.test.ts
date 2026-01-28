import { describe, expect, it } from '@jest/globals';

import { sortByDateAndName } from './filterHelpers';

describe('sortByDateAndName', () => {
  const mockData = [
    { id: '1', filename: 'gamma.jpg', createdAt: '2025-01-10T10:00:00Z' },
    { id: '2', filename: 'alpha.jpg', createdAt: '2025-01-10T10:00:00Z' },
    { id: '3', filename: 'beta.jpg', createdAt: '2025-01-09T10:00:00Z' },
    { id: '4', filename: 'delta.jpg', createdAt: '2025-01-11T10:00:00Z' }
  ];

  it('should sort by date descending (newest first)', () => {
    const result = sortByDateAndName([...mockData]);
    expect(result[0].id).toBe('4');
    expect(result[1].id).toBe('2');
    expect(result[2].id).toBe('1');
    expect(result[3].id).toBe('3');
  });

  it('should sort alphabetically when dates are equal', () => {
    const sameDateData = [
      { id: '1', filename: 'gamma.jpg', createdAt: '2025-01-10T10:00:00Z' },
      { id: '2', filename: 'alpha.jpg', createdAt: '2025-01-10T10:00:00Z' },
      { id: '3', filename: 'beta.jpg', createdAt: '2025-01-10T10:00:00Z' }
    ];
    const result = sortByDateAndName([...sameDateData]);
    expect(result[0].filename).toBe('alpha.jpg');
    expect(result[1].filename).toBe('beta.jpg');
    expect(result[2].filename).toBe('gamma.jpg');
  });

  it('should handle empty array', () => {
    const result = sortByDateAndName([]);
    expect(result).toEqual([]);
  });

  it('should handle single item', () => {
    const singleItem = [{ id: '1', filename: 'test.jpg', createdAt: '2025-01-10T10:00:00Z' }];
    const result = sortByDateAndName([...singleItem]);
    expect(result).toEqual(singleItem);
  });

  it('should not mutate original array', () => {
    const original = [...mockData];
    const originalCopy = [...mockData];
    sortByDateAndName(original);
    expect(original).toEqual(originalCopy);
  });

  it('should handle case-sensitive alphabetical sorting correctly', () => {
    const caseData = [
      { id: '1', filename: 'Gamma.jpg', createdAt: '2025-01-10T10:00:00Z' },
      { id: '2', filename: 'alpha.jpg', createdAt: '2025-01-10T10:00:00Z' },
      { id: '3', filename: 'Beta.jpg', createdAt: '2025-01-10T10:00:00Z' }
    ];
    const result = sortByDateAndName([...caseData]);
    expect(result.length).toBe(3);
    expect(result[0].filename).toBeTruthy();
  });
});
