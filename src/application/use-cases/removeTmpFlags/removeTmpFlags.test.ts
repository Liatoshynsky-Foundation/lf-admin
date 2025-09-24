import { removeTmpFlagsRecursively } from './removeTmpFlags';

describe('removeTmpFlagsRecursively', () => {
  it('should change isTmp: true to isTmp: false at the top level of an object', () => {
    const data = { id: 1, name: 'Test', isTmp: true };
    const expected = { id: 1, name: 'Test', isTmp: false };
    expect(removeTmpFlagsRecursively(data)).toEqual(expected);
  });

  it('should handle deeply nested objects with isTmp: true', () => {
    const data = {
      level1: {
        data: 'some data',
        level2: {
          isTmp: true,
          value: 42
        }
      }
    };
    const expected = {
      level1: {
        data: 'some data',
        level2: {
          isTmp: false,
          value: 42
        }
      }
    };
    expect(removeTmpFlagsRecursively(data)).toEqual(expected);
  });

  it('should NOT change isTmp if its value is already false', () => {
    const data = { isTmp: false };
    expect(removeTmpFlagsRecursively(data)).toEqual({ isTmp: false });
  });

  it('should return an empty object for an empty object input', () => {
    expect(removeTmpFlagsRecursively({})).toEqual({});
  });

  it('should return an empty array for an empty array input', () => {
    expect(removeTmpFlagsRecursively([])).toEqual([]);
  });

  it.each([[null], [undefined], ['a string'], [12345], [true], [false]])(
    'should return primitive value %p unchanged',
    (primitive) => {
      expect(removeTmpFlagsRecursively(primitive)).toBe(primitive);
    }
  );
});
