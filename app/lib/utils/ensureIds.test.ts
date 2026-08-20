import { ensureIds } from './ensureIds';

jest.mock('./generateUniqueId', () => ({
  generateUniqueId: jest.fn().mockReturnValue('mock-uuid')
}));

describe('ensureIds utility', () => {
  it('should assign a new id if item has no id', () => {
    const list = [{ name: 'Alice' }, { name: 'Bob' }];
    const result = ensureIds(list);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('mock-uuid');
    expect(result[1].id).toBe('mock-uuid');
    expect(result[0].name).toBe('Alice');
    expect(result[1].name).toBe('Bob');
  });

  it('should keep existing ids if present', () => {
    const list = [
      { id: '123', name: 'Alice' },
      { id: '456', name: 'Bob' }
    ];
    const result = ensureIds(list);

    expect(result[0].id).toBe('123');
    expect(result[1].id).toBe('456');
  });

  it('should mix existing and new ids correctly', () => {
    const list = [{ id: '123', name: 'Alice' }, { name: 'Bob' }];
    const result = ensureIds(list);

    expect(result[0].id).toBe('123');
    expect(result[1].id).toBe('mock-uuid');
    expect(result[1].name).toBe('Bob');
  });

  it('should preserve other properties untouched', () => {
    const list = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 }
    ];
    const result = ensureIds(list);

    expect(result[0].name).toBe('Alice');
    expect(result[0].age).toBe(30);
    expect(result[1].name).toBe('Bob');
    expect(result[1].age).toBe(25);
  });

  it('should return empty array if input is empty', () => {
    const result = ensureIds([]);
    expect(result).toEqual([]);
  });
});
